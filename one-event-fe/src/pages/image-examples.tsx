import React from 'react';
import Head from 'next/head';
import ImageExamples from '../components/examples/ImageExamples';

const ImageDemoPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Image Examples - OneEvent</title>
        <meta name="description" content="Image component examples for OneEvent" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🖼️ Image Component Examples
            </h1>
            <p className="mt-2 text-gray-600">
              ตัวอย่างการใช้งานรูปภาพในรูปแบบต่างๆ สำหรับ OneEvent
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="py-8">
          <ImageExamples />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500">
              📚 ดู documentation เพิ่มเติมได้ที่ IMAGE-EXAMPLES.md
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ImageDemoPage;
