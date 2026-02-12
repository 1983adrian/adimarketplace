import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Send Web Push notifications with proper RFC 8291 encryption.
 * Delivers title, body, and data to the service worker even when the user
 * is NOT on the site. Vibration pattern is handled in sw-push.js.
 */

// ─── Crypto helpers for Web Push (RFC 8291 / aes128gcm) ───

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64 + padding);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function base64UrlEncode(arr: Uint8Array): string {
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    result.set(b, offset);
    offset += b.length;
  }
  return result;
}

async function createInfo(
  type: string,
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);
  const header = encoder.encode('Content-Encoding: ');
  const nul = new Uint8Array([0]);
  const keyLabel = encoder.encode('P-256');

  return concatBuffers(
    header,
    typeBytes,
    nul,
    keyLabel,
    nul,
    new Uint8Array([0, 65]),
    clientPublicKey,
    new Uint8Array([0, 65]),
    serverPublicKey,
  );
}

async function deriveEncryptionKeys(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  localKeyPair: CryptoKeyPair,
  salt: Uint8Array,
) {
  const clientPublicKeyBytes = base64UrlDecode(subscription.keys.p256dh);
  const authSecret = base64UrlDecode(subscription.keys.auth);

  // Import the client's public key
  const clientPublicKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  // ECDH shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientPublicKey },
    localKeyPair.privateKey,
    256,
  );

  const sharedSecretBytes = new Uint8Array(sharedSecret);
  const localPublicKeyBytes = new Uint8Array(
    await crypto.subtle.exportKey('raw', localKeyPair.publicKey),
  );

  // PRK = HKDF-Extract(auth_secret, ecdh_secret)
  const encoder = new TextEncoder();
  const authInfo = concatBuffers(
    encoder.encode('Content-Encoding: auth\0'),
  );

  const prkKey = await crypto.subtle.importKey(
    'raw', authSecret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, sharedSecretBytes));

  // Derive CEK info and nonce info
  const cekInfo = await createInfo('aesgcm', clientPublicKeyBytes, localPublicKeyBytes);
  const nonceInfo = await createInfo('nonce', clientPublicKeyBytes, localPublicKeyBytes);

  // IKM from auth + PRK
  const ikmKey = await crypto.subtle.importKey(
    'raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const ikm = new Uint8Array(await crypto.subtle.sign('HMAC', ikmKey, concatBuffers(authInfo, new Uint8Array([1]))));

  // Content encryption key (CEK) - 16 bytes
  const cekHmacKey = await crypto.subtle.importKey(
    'raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const cekFull = new Uint8Array(await crypto.subtle.sign('HMAC', cekHmacKey, ikm));

  const cekPrkKey = await crypto.subtle.importKey(
    'raw', cekFull, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const cekDerived = new Uint8Array(await crypto.subtle.sign('HMAC', cekPrkKey, concatBuffers(cekInfo, new Uint8Array([1]))));
  const cek = cekDerived.slice(0, 16);

  // Nonce - 12 bytes
  const noncePrkKey = await crypto.subtle.importKey(
    'raw', cekFull, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const nonceDerived = new Uint8Array(await crypto.subtle.sign('HMAC', noncePrkKey, concatBuffers(nonceInfo, new Uint8Array([1]))));
  const nonce = nonceDerived.slice(0, 12);

  return { cek, nonce, localPublicKeyBytes };
}

async function encryptPayload(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payloadText: string,
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );

  const { cek, nonce, localPublicKeyBytes } = await deriveEncryptionKeys(
    subscription, localKeyPair, salt,
  );

  // Pad payload with 2-byte padding length prefix (0x0000 = no padding)
  const payloadBytes = new TextEncoder().encode(payloadText);
  const paddedPayload = concatBuffers(new Uint8Array([0, 0]), payloadBytes);

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw', cek, { name: 'AES-GCM' }, false, ['encrypt'],
  );
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      aesKey,
      paddedPayload,
    ),
  );

  return { encrypted, salt, localPublicKey: localPublicKeyBytes };
}

async function createVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
): Promise<{ authorization: string; cryptoKey: string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  // JWT header + payload
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: 'mailto:contact@marketplaceromania.com',
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import VAPID private key for signing
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: base64UrlEncode(privateKeyBytes),
    x: base64UrlEncode(base64UrlDecode(vapidPublicKey).slice(1, 33)),
    y: base64UrlEncode(base64UrlDecode(vapidPublicKey).slice(33, 65)),
  };

  const signingKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signingKey,
    new TextEncoder().encode(unsignedToken),
  );

  // Convert DER signature to raw r||s format (64 bytes)
  const sigBytes = new Uint8Array(signatureBuffer);
  let r: Uint8Array, s: Uint8Array;

  if (sigBytes.length === 64) {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32, 64);
  } else {
    // DER encoded
    r = sigBytes.slice(0, sigBytes.length / 2);
    s = sigBytes.slice(sigBytes.length / 2);
    // Pad to 32 bytes each
    if (r.length < 32) r = concatBuffers(new Uint8Array(32 - r.length), r);
    if (s.length < 32) s = concatBuffers(new Uint8Array(32 - s.length), s);
    r = r.slice(-32);
    s = s.slice(-32);
  }

  const signature = base64UrlEncode(concatBuffers(r, s));
  const jwt = `${unsignedToken}.${signature}`;

  return {
    authorization: `WebPush ${jwt}`,
    cryptoKey: `p256ecdsa=${vapidPublicKey}`,
  };
}

// ─── Main handler ───

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { user_id, title, body, data } = await req.json();

    // Only allow sending to self or if admin
    if (user.id !== user_id) {
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Cannot send notifications for other users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      // Fallback to in-app notification
      await supabase.from('notifications').insert({
        user_id,
        type: data?.type || 'general',
        title,
        message: body,
        data: data || {},
      });
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured, created in-app notification', sent: 0, fallback: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Get web push subscriptions for this user
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('id, token, platform')
      .eq('user_id', user_id)
      .eq('platform', 'web')
      .eq('is_valid', true);

    if (tokenError) {
      console.error('Error fetching web push tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('No web push subscriptions found for user:', user_id);
      await supabase.from('notifications').insert({
        user_id,
        type: data?.type || 'general',
        title,
        message: body,
        data: data || {},
      });
      return new Response(
        JSON.stringify({ message: 'No web push subscriptions, created in-app notification', sent: 0, fallback: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build the notification payload that sw-push.js will receive
    const notificationPayload = JSON.stringify({
      title,
      body,
      data: data || {},
    });

    let sent = 0;
    let failed = 0;

    for (const tokenRow of tokens) {
      try {
        const subscription = JSON.parse(tokenRow.token);

        if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
          console.error('Invalid subscription format for token:', tokenRow.id);
          await supabase.from('push_tokens').update({ is_valid: false }).eq('id', tokenRow.id);
          failed++;
          continue;
        }

        // Encrypt the payload with Web Push encryption (RFC 8291)
        const { encrypted, salt, localPublicKey } = await encryptPayload(subscription, notificationPayload);

        // Create VAPID authorization headers
        const vapidHeaders = await createVapidAuthHeader(subscription.endpoint, vapidPublicKey, vapidPrivateKey);

        // Send encrypted push to the push service
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aesgcm',
            'Content-Length': String(encrypted.length),
            'Encryption': `salt=${base64UrlEncode(salt)}`,
            'Crypto-Key': `dh=${base64UrlEncode(localPublicKey)};${vapidHeaders.cryptoKey}`,
            'Authorization': vapidHeaders.authorization,
            'TTL': '86400',
            'Urgency': 'high',
          },
          body: encrypted,
        });

        if (response.ok || response.status === 201) {
          sent++;
          await supabase.from('push_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', tokenRow.id);
        } else if (response.status === 410 || response.status === 404) {
          console.log('Removing expired web push subscription:', tokenRow.id);
          await supabase.from('push_tokens').update({ is_valid: false }).eq('id', tokenRow.id);
          failed++;
        } else {
          const errText = await response.text();
          console.error(`Push failed for ${tokenRow.id}: ${response.status} ${errText}`);
          failed++;
        }
      } catch (err) {
        console.error('Error sending web push:', err);
        failed++;
      }
    }

    // Also ensure in-app notification exists
    await supabase.from('notifications').insert({
      user_id,
      type: data?.type || 'general',
      title,
      message: body,
      data: data || {},
    });

    console.log(`Web Push: ${sent} sent, ${failed} failed out of ${tokens.length}`);

    return new Response(
      JSON.stringify({ sent, failed, total: tokens.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('send-web-push error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
