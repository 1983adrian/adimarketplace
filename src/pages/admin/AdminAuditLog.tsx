import { useState } from 'react';
import { History, Search, Filter, Download, User, Settings, Package, Shield, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subDays, subHours, subMinutes } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'user' | 'listing' | 'order' | 'settings' | 'security' | 'financial';
  details: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

// Mock audit log data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: subMinutes(new Date(), 5).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Updated platform fees',
    category: 'financial',
    details: 'Changed buyer fee from £1.50 to £2.00',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: '2',
    timestamp: subMinutes(new Date(), 15).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Approved listing',
    category: 'listing',
    details: 'Approved listing #abc123 - "MacBook Pro"',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: '3',
    timestamp: subHours(new Date(), 1).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'User role updated',
    category: 'user',
    details: 'Changed user@example.com role to moderator',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: '4',
    timestamp: subHours(new Date(), 2).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Login attempt',
    category: 'security',
    details: 'Successful admin login',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: '5',
    timestamp: subHours(new Date(), 3).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Refund processed',
    category: 'financial',
    details: 'Refunded order #xyz789 - £45.00',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: '6',
    timestamp: subHours(new Date(), 5).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Listing removed',
    category: 'listing',
    details: 'Removed listing #def456 - Policy violation',
    ipAddress: '192.168.1.1',
    status: 'warning'
  },
  {
    id: '7',
    timestamp: subDays(new Date(), 1).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Platform settings updated',
    category: 'settings',
    details: 'Updated email notification settings',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
  {
    id: '8',
    timestamp: subDays(new Date(), 1).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'User suspended',
    category: 'user',
    details: 'Suspended user suspicious@example.com - Fraudulent activity',
    ipAddress: '192.168.1.1',
    status: 'warning'
  },
  {
    id: '9',
    timestamp: subDays(new Date(), 2).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Failed login attempt',
    category: 'security',
    details: 'Failed admin login - Wrong password',
    ipAddress: '10.0.0.5',
    status: 'error'
  },
  {
    id: '10',
    timestamp: subDays(new Date(), 3).toISOString(),
    userId: 'admin-1',
    userName: 'Adrian Chiriță',
    action: 'Dispute resolved',
    category: 'order',
    details: 'Resolved dispute #disp123 - Refund issued to buyer',
    ipAddress: '192.168.1.1',
    status: 'success'
  },
];

const getCategoryIcon = (category: AuditLogEntry['category']) => {
  switch (category) {
    case 'user': return <User className="h-4 w-4" />;
    case 'listing': return <Package className="h-4 w-4" />;
    case 'order': return <History className="h-4 w-4" />;
    case 'settings': return <Settings className="h-4 w-4" />;
    case 'security': return <Shield className="h-4 w-4" />;
    case 'financial': return <DollarSign className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: AuditLogEntry['status']) => {
  switch (status) {
    case 'success': return 'default';
    case 'warning': return 'secondary';
    case 'error': return 'destructive';
  }
};

export default function AdminAuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Category', 'Details', 'IP Address', 'Status'],
      ...filteredLogs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.userName,
        log.action,
        log.category,
        log.details,
        log.ipAddress,
        log.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground">Track all administrative actions</p>
          </div>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockAuditLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAuditLogs.filter(l => l.status === 'success').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAuditLogs.filter(l => l.status === 'warning').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAuditLogs.filter(l => l.status === 'error').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions, details, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="listing">Listings</SelectItem>
                  <SelectItem value="order">Orders</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {mockAuditLogs.length} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {log.details}
                      </TableCell>
                      <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
