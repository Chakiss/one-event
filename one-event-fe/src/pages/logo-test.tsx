import React from 'react';
import { Logo } from '../components/common/Logo';
import { SimpleLogo } from '../components/common/SimpleLogo';
import Image from 'next/image';

export default function LogoTest() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Logo Display Test</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">New Logo Components</h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <p className="mb-2">Small</p>
              <Logo size="sm" />
            </div>
            <div className="text-center">
              <p className="mb-2">Medium</p>
              <Logo size="md" />
            </div>
            <div className="text-center">
              <p className="mb-2">Large</p>
              <Logo size="lg" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">SimpleLogo Components</h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <p className="mb-2">Small</p>
              <SimpleLogo size="sm" />
            </div>
            <div className="text-center">
              <p className="mb-2">Medium</p>
              <SimpleLogo size="md" />
            </div>
            <div className="text-center">
              <p className="mb-2">Large</p>
              <SimpleLogo size="lg" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Direct Next.js Image</h2>
          <Image
            src="/logo.png"
            alt="Direct Logo"
            width={120}
            height={120}
            className="drop-shadow-sm"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Standard img tag</h2>
          <img
            src="/logo.png"
            alt="Standard IMG Logo"
            width={120}
            height={120}
            className="drop-shadow-sm"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Network Test</h2>
          <img
            src="http://localhost:3000/logo.png"
            alt="Network Logo"
            width={120}
            height={120}
            className="drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
