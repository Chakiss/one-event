'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      await apiClient.verifyEmail({ token: verificationToken });
      setStatus('success');
      setMessage('อีเมลของคุณได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบได้แล้ว');
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 400) {
        setStatus('expired');
        setMessage('ลิงก์ยืนยันอีเมลหมดอายุหรือไม่ถูกต้อง');
      } else {
        setStatus('error');
        setMessage('เกิดข้อผิดพลาดในการยืนยันอีเมล กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  const resendVerification = async () => {
    try {
      setIsResending(true);
      // Get email from query params or localStorage
      const email = router.query.email as string;
      if (email) {
        await apiClient.resendEmailVerification({ email });
        setMessage('ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ');
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">กำลังยืนยันอีเมล...</h3>
            <p className="text-gray-600">กรุณารอสักครู่</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันอีเมลสำเร็จ!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <Mail className="h-10 w-10 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ลิงก์หมดอายุ</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={resendVerification}
              disabled={isResending}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  ส่งอีเมลยืนยันใหม่
                </>
              )}
            </button>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    ส่งอีเมลยืนยันใหม่
                  </>
                )}
              </button>
              <Link
                href="/auth/register"
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                กลับไปสมัครสมาชิกใหม่
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OneEvent</h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">ยืนยันอีเมล</h2>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {renderContent()}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ติดต่อสอบถาม?{' '}
            <a href="mailto:support@oneevent.com" className="text-indigo-600 hover:text-indigo-500">
              support@oneevent.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
