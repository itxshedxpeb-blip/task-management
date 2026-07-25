'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  Check,
  Building2,
  Users,
  HardDrive,
  RefreshCw,
  AlertCircle,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminApi } from '@/modules/admin/services/adminApi';

const PLANS = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    features: ['Up to 10 users', '5GB storage', 'Basic task management', 'Email support'],
    companyCount: 18,
    maxUsers: 10,
    storage: '5GB',
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    features: ['Up to 50 users', '50GB storage', 'Advanced task management', 'Priority support', 'Custom roles', 'API access'],
    companyCount: 22,
    maxUsers: 50,
    storage: '50GB',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    features: ['Unlimited users', '500GB storage', 'Full feature access', 'Dedicated support', 'SSO integration', 'Audit logs', 'Custom branding'],
    companyCount: 7,
    maxUsers: -1,
    storage: '500GB',
  },
];

export default function AdminPlansPage() {
  const { data: plansData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => adminApi.getPlans(),
  });

  const plansList = (plansData as any)?.data || PLANS;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load plans.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plans & Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage subscription plans, pricing, and billing history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative !hover:-translate-y-0 !hover:shadow-sm ${
              plan.popular ? 'border-[#f97316]/50 shadow-[0_0_0_1px_rgba(249,115,22,0.2)]' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#f97316] text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-3">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Companies subscribed</span>
                  <span className="font-medium text-foreground">{plan.companyCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Subscription Overview</CardTitle>
          <CardDescription>Companies by subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Max Users</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLANS.map((plan) => (
                <TableRow key={plan.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {plan.name}
                      {plan.popular && <Badge variant="warning" className="text-[10px]">Popular</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{plan.price}{plan.period}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.companyCount}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.storage}</TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    ${(plan.companyCount * parseInt(plan.price.replace('$', ''))).toLocaleString()}/mo
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
