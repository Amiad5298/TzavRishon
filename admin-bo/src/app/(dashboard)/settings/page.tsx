'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Settings, Database, Shield, Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">System configuration and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle>Application Info</CardTitle>
                <CardDescription>Current deployment information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Application</dt>
                <dd className="text-sm font-medium text-gray-900">TzavRishon Admin BO</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Version</dt>
                <dd className="text-sm font-medium text-gray-900">1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Environment</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {process.env.NODE_ENV || 'development'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Database</CardTitle>
                <CardDescription>Database connection status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm font-medium text-green-600">Connected</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Type</dt>
                <dd className="text-sm font-medium text-gray-900">PostgreSQL</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Access</dt>
                <dd className="text-sm font-medium text-gray-900">Read-only</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Authentication settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Auth Method</dt>
                <dd className="text-sm font-medium text-gray-900">Username/Password</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Session Duration</dt>
                <dd className="text-sm font-medium text-gray-900">24 hours</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Cookie Security</dt>
                <dd className="text-sm font-medium text-gray-900">HttpOnly, Secure</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Future Features</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                User management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                Question management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                Export reports
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                Email notifications
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

