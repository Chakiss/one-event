import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import type { Event, RegistrationField } from '@/types/api';

const PublicRegistrationPage = () => {
  const router = useRouter();
  const { id: eventId } = router.query;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEventData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load event details
      const eventResponse = await apiClient.get<Event>(`/events/${eventId}`);
      setEvent(eventResponse.data);
      
      // Extract registration fields from event data
      const registrationFields = eventResponse.data.registrationFields?.fields || [];
      setFields(registrationFields);
      
    } catch (error) {
      console.error('Failed to load event data:', error);
      setError('Failed to load event information');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId && typeof eventId === 'string') {
      loadEventData();
    }
  }, [eventId, loadEventData]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Validate required fields
    if (!formData.guestName) {
      errors.push('กรุณากรอกชื่อ-นามสกุล');
    }
    
    if (!formData.guestEmail) {
      errors.push('กรุณากรอกอีเมล');
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.guestEmail)) {
        errors.push('รูปแบบอีเมลไม่ถูกต้อง');
      }
    }
    
    // Validate custom fields
    fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        errors.push(`${field.label} is required`);
      }
      
      if (field.validation && formData[field.id]) {
        const value = formData[field.id];
        const validation = field.validation;
        
        if (validation.minLength && value.length < validation.minLength) {
          errors.push(`${field.label} must be at least ${validation.minLength} characters`);
        }
        
        if (validation.maxLength && value.length > validation.maxLength) {
          errors.push(`${field.label} must not exceed ${validation.maxLength} characters`);
        }
        
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          errors.push(`${field.label} format is invalid`);
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();      console.log('Form validation errors:', validationErrors);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const registrationData = {
        eventId: eventId as string,
        guestName: formData.guestName?.trim() || undefined,
        guestEmail: formData.guestEmail?.trim() || undefined,
        guestPhone: formData.guestPhone?.trim() || undefined,
        customFields: Object.keys(formData)
          .filter(key => !['guestName', 'guestEmail', 'guestPhone'].includes(key))
          .reduce((obj, key) => {
            if (formData[key]) { // Only include non-empty values
              obj[key] = formData[key] as string | number | boolean;
            }
            return obj;
          }, {} as Record<string, string | number | boolean>),
        registrationSource: 'direct',
        // Get UTM parameters from URL (only if they exist)
        ...(router.query.utm_source && { utmSource: router.query.utm_source as string }),
        ...(router.query.utm_medium && { utmMedium: router.query.utm_medium as string }),
        ...(router.query.utm_campaign && { utmCampaign: router.query.utm_campaign as string }),
      };

      // Remove undefined values to avoid sending empty data
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key as keyof typeof registrationData] === undefined || registrationData[key as keyof typeof registrationData] === '') {
          delete registrationData[key as keyof typeof registrationData];
        }
      });
       console.log('Sending registration data:', registrationData); // Debug log
      console.log('guestEmail value:', `"${registrationData.guestEmail}"`); // Debug email specifically
      console.log('Event ID:', eventId); // Debug event ID
      console.log('Full request payload:', JSON.stringify(registrationData, null, 2)); // Debug full payload
      
      // Double-check email format before sending
      if (registrationData.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.guestEmail)) {
        setError('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
        return;
      }

      const response = await apiClient.post(`/public/registrations`, registrationData);
      console.log('Registration response:', response); // Debug response
      setSuccess(true);
      
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      
      // Handle different error types
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        
        if (axiosError.response?.status === 409) {
          setError('อีเมลนี้ได้ลงทะเบียนกิจกรรมนี้ไปแล้ว หากคุณเป็นเจ้าของอีเมลนี้และต้องการแก้ไขข้อมูล กรุณาติดต่อผู้จัดงาน หรือใช้อีเมลอื่นในการลงทะเบียน');
        } else if (axiosError.response?.status === 400) {
          const errorMessage = axiosError.response?.data?.message;
          
          if (Array.isArray(errorMessage)) {
            // Handle validation errors array
            const validationErrors = errorMessage.map(err => {
              if (err.includes('guestEmail must be an email')) {
                return 'รูปแบบอีเมลไม่ถูกต้อง';
              } else if (err.includes('guestName')) {
                return 'กรุณากรอกชื่อ-นามสกุล';
              } else if (err.includes('eventId')) {
                return 'ไม่พบข้อมูลกิจกรรม';
              }
              return err;
            });
            setError(validationErrors.join(', '));
          } else if (typeof errorMessage === 'string') {
            if (errorMessage.includes('fully booked')) {
              setError('กิจกรรมนี้เต็มแล้ว ขออภัยในความไม่สะดวก');
            } else {
              setError('ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
            }
          } else {
            setError('ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
          }
        } else {
          const errorMessage = axiosError.response?.data?.message;
          setError(errorMessage || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
        }
      } else {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: RegistrationField) => {
    const commonProps = {
      id: field.id,
      required: field.required,
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
      placeholder: field.placeholder,
      value: formData[field.id] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => handleInputChange(field.id, e.target.value),
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            {...commonProps}
            type={field.type}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={3}
          />
        );
        
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      case 'multiselect':
        const currentMultiValues = formData[field.id] ? formData[field.id].split(',') : [];
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={currentMultiValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...currentMultiValues, option]
                      : currentMultiValues.filter((v: string) => v !== option);
                    handleInputChange(field.id, newValues.join(','));
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData[field.id] === 'true'}
              onChange={(e) => handleInputChange(field.id, e.target.checked.toString())}
              className="mr-2"
            />
            {field.label}
          </label>
        );
        
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
          />
        );
        
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow flex items-center justify-center py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
              <p className="text-gray-600">The event you&apos;re looking for could not be found.</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center pb-8">
            <p className="text-xs text-gray-400">
              Powered by <span className="font-medium text-gray-500">OneEvent</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for registering for <strong>{event.title}</strong>. 
                You will receive a confirmation email shortly.
              </p>
              <div className="text-sm text-gray-500">
                <p><strong>Event Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center pb-8">
            <p className="text-xs text-gray-400">
              Powered by <span className="font-medium text-gray-500">OneEvent</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Event Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
          {event.imageUrl && (
            <Image 
              src={event.imageUrl} 
              alt={event.title}
              width={800}
              height={200}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7M9 7h6" />
                </svg>
                {new Date(event.startDate).toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {event.location}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Registration</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-red-800">{error}</div>
                  {error.includes('ลงทะเบียนกิจกรรมนี้ไปแล้ว') && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          const email = formData.guestEmail;
                          if (email) {
                            alert(`หากต้องการยกเลิกการลงทะเบียนหรือแก้ไขข้อมูล กรุณาติดต่อผู้จัดงานพร้อมแจ้งอีเมล: ${email}`);
                          } else {
                            alert('กรุณาติดต่อผู้จัดงานหากต้องการยกเลิกการลงทะเบียนหรือแก้ไขข้อมูล');
                          }
                        }}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                      >
                        ติดต่อผู้จัดงาน
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Default Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="guestName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.guestName || ''}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="guestEmail"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.guestEmail || ''}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="guestPhone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.guestPhone || ''}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                />
              </div>
            </div>

            {/* Custom Fields */}
            {fields.filter(field => field.visible).map(field => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Registering...' : 'Register for Event'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-medium text-gray-500">OneEvent</span>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PublicRegistrationPage;
