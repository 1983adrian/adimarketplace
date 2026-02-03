/**
 * AI POLICY - RESTRICȚII ABSOLUTE PENTRU TOATE SISTEMELE AI
 * 
 * Acest fișier definește regulile stricte pentru toate sistemele AI din platformă.
 * Aceste reguli sunt IMUABILE și nu pot fi modificate programatic.
 */

export const AI_POLICY = {
  // Restricții absolute - niciun AI nu are voie să execute aceste acțiuni
  FORBIDDEN_ACTIONS: [
    'delete_user',
    'block_user', 
    'suspend_user',
    'ban_user',
    'delete_listing',
    'delete_order',
    'delete_conversation',
    'delete_message',
    'modify_user_role',
    'delete_data',
    'purge_records',
  ] as const,

  // Acțiuni permise - AI poate doar să raporteze și să recomande
  ALLOWED_ACTIONS: [
    'report_issue',
    'suggest_action',
    'analyze_data',
    'generate_content',
    'send_notification',
    'create_alert',
    'update_status', // doar pentru ordere/promoții, NU utilizatori
    'assign_default_role', // doar pentru utilizatori noi fără rol
    'create_profile', // doar pentru utilizatori fără profil
  ] as const,

  // Mesaj de politică pentru prompt-urile AI
  SYSTEM_PROMPT_ADDENDUM: `
RESTRICȚIE ABSOLUTĂ - LITERA DE LEGE:
1. NU ai voie să ștergi utilizatori sau date sub nicio formă
2. NU ai voie să blochezi sau suspendezi utilizatori
3. NU ai voie să modifici roluri existente (doar să atribui rol default utilizatorilor noi)
4. Poți DOAR să raportezi probleme și să recomanzi acțiuni
5. TOATE deciziile finale sunt luate de administrator
6. Orice acțiune care afectează utilizatorii necesită APROBAREA EXPLICITĂ a administratorului
`,

  // Verificare acțiune permisă
  isActionAllowed: (action: string): boolean => {
    const forbidden = AI_POLICY.FORBIDDEN_ACTIONS as readonly string[];
    return !forbidden.some(f => action.toLowerCase().includes(f.replace('_', '')));
  },

  // Verificare dacă acțiunea necesită confirmare
  requiresConfirmation: (action: string): boolean => {
    // Toate acțiunile care modifică date necesită confirmare
    const autoAllowed = ['analyze', 'report', 'suggest', 'generate', 'scan'];
    return !autoAllowed.some(a => action.toLowerCase().includes(a));
  }
} as const;

export type ForbiddenAction = typeof AI_POLICY.FORBIDDEN_ACTIONS[number];
export type AllowedAction = typeof AI_POLICY.ALLOWED_ACTIONS[number];
