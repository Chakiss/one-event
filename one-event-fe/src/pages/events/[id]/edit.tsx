import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import type { Event } from '@/types/api';

const EditEventPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id: eventId } = router.query;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    maxAttendees: '',
    type: 'conference' as 'conference' | 'workshop' | 'seminar' | 'networking' | 'other',
    status: 'draft' as 'draft' | 'published' | 'cancelled',
    imageUrl: '',
  });

  const loadEventData = useCallback(async () => {
    try {
      setIsLoading(true);
      const eventData = await apiClient.getEvent(eventId as string);
      setEvent(eventData);
      
      // Populate form with existing data
      const startDate = new Date(eventData.startDate);
      const endDate = new Date(eventData.endDate);
      
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        location: eventData.location || '',
        address: eventData.address || '',
        maxAttendees: eventData.maxAttendees?.toString() || '',
        type: eventData.type || 'conference',
        status: eventData.status || 'draft',
        imageUrl: eventData.imageUrl || '',
      });
      
    } catch (error) {
      console.error('Failed to load event:', error);
      setErrors({ general: 'ไม่สามารถโหลดข้อมูลกิจกรรมได้' });
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (eventId && typeof eventId === 'string') {
      loadEventData();
    }
  }, [eventId, user, loading, router, loadEventData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'กรุณาใส่ชื่อกิจกรรม';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'กรุณาใส่รายละเอียดกิจกรรม';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'กรุณาเลือกวันที่เริ่ม';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'กรุณาเลือกวันที่สิ้นสุด';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'กรุณาเลือกเวลาเริ่ม';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'กรุณาเลือกเวลาสิ้นสุด';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'กรุณาใส่สถานที่';
    }

    if (!formData.maxAttendees || parseInt(formData.maxAttendees) <= 0) {
      newErrors.maxAttendees = 'กรุณาใส่จำนวนผู้เข้าร่วมที่ถูกต้อง';
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.endDate = 'วันที่และเวลาสิ้นสุดต้องมาหลังจากวันที่และเวลาเริ่ม';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        maxAttendees: parseInt(formData.maxAttendees),
        type: formData.type,
        status: formData.status,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      await apiClient.updateEvent(eventId as string, updateData);
      
      // Redirect to event management page
      router.push(`/events/${eventId}/manage`);
      
    } catch (error) {
      console.error('Failed to update event:', error);
      setErrors({ general: 'ไม่สามารถอัปเดตกิจกรรมได้ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบกิจกรรม</h1>
          <p className="text-gray-600 mb-4">ไม่พบกิจกรรมที่ระบุ</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            กลับไปหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7M9 7h6" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">OneEvent</h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{user?.name || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href={`/events/${eventId}/manage`} className="ml-4 text-gray-400 hover:text-gray-500">
                    {event.title}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">แก้ไขกิจกรรม</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900">แก้ไขกิจกรรม</h1>
          <p className="text-gray-600 mt-2">แก้ไขข้อมูลกิจกรรมของคุณ</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">ข้อมูลพื้นฐาน</h3>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    ชื่อกิจกรรม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="กรอกชื่อกิจกรรม"
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    รายละเอียดกิจกรรม <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="อธิบายรายละเอียดกิจกรรม"
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      ประเภทกิจกรรม
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    >
                      <option value="conference">การประชุม</option>
                      <option value="workshop">เวิร์คช็อป</option>
                      <option value="seminar">สัมมนา</option>
                      <option value="networking">การเชื่อมโยงเครือข่าย</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      สถานะ
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    >
                      <option value="draft">ร่าง</option>
                      <option value="published">เผยแพร่</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">วันที่และเวลา</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      วันที่เริ่ม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                        errors.startDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-2 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                      เวลาเริ่ม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                        errors.startTime ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.startTime && (
                      <p className="mt-2 text-sm text-red-600">{errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      วันที่สิ้นสุด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="mt-2 text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      เวลาสิ้นสุด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                        errors.endTime ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.endTime && (
                      <p className="mt-2 text-sm text-red-600">{errors.endTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">สถานที่</h3>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    สถานที่จัดงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="เช่น ห้องประชุมใหญ่ อาคาร A"
                  />
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    ที่อยู่
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="ที่อยู่ของสถานที่จัดงาน"
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">รายละเอียดกิจกรรม</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
                      จำนวนผู้เข้าร่วมสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="maxAttendees"
                      name="maxAttendees"
                      min="1"
                      value={formData.maxAttendees}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                        errors.maxAttendees ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="เช่น 100"
                    />
                    {errors.maxAttendees && (
                      <p className="mt-2 text-sm text-red-600">{errors.maxAttendees}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    URL รูปภาพ
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link
                  href={`/events/${eventId}/manage`}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  ยกเลิก
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'กำลังอัปเดต...' : 'อัปเดตกิจกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditEventPage;
