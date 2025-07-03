import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Copy, Settings, 
  Type, Mail, Phone, Calendar, Hash, CheckSquare, RadioIcon, 
  List, MessageSquare, ToggleLeft, Save
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type FieldType = 'text' | 'email' | 'phone' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'number' | 'file' | 'url';

interface RegistrationField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    fileTypes?: string[];
    maxFileSize?: number;
  };
  order: number;
  visible: boolean;
  helpText?: string;
}

interface RegistrationFormBuilderProps {
  eventId: string;
  onSave?: (fields: RegistrationField[]) => void;
}

const FIELD_TYPES: Array<{
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { type: 'text', label: 'Text Input', icon: Type, description: 'Single line text input' },
  { type: 'textarea', label: 'Text Area', icon: MessageSquare, description: 'Multi-line text input' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
  { type: 'phone', label: 'Phone', icon: Phone, description: 'Phone number input' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Single choice dropdown' },
  { type: 'multiselect', label: 'Multi Select', icon: CheckSquare, description: 'Multiple choice checkboxes' },
  { type: 'radio', label: 'Radio Buttons', icon: RadioIcon, description: 'Single choice radio buttons' },
  { type: 'checkbox', label: 'Checkbox', icon: ToggleLeft, description: 'Single checkbox' },
  { type: 'file', label: 'File Upload', icon: Plus, description: 'File upload field' },
  { type: 'url', label: 'URL', icon: Type, description: 'Website URL input' },
];

const RegistrationFormBuilder: React.FC<RegistrationFormBuilderProps> = ({ eventId, onSave }) => {
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadRegistrationFields = useCallback(async () => {
    try {
      // Get event data which includes registrationFields
      const eventResponse = await apiClient.getEvent(eventId);
      setFields(eventResponse.registrationFields?.fields || []);
    } catch (error) {
      console.error('Failed to load registration fields:', error);
      // Set default fields if loading fails
      setFields([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadRegistrationFields();
  }, [loadRegistrationFields]);

  const addField = (type: FieldType = 'text') => {
    const newField: RegistrationField = {
      id: `field_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      order: fields.length,
      visible: true,
      ...(type === 'select' || type === 'multiselect' || type === 'radio' ? { options: ['Option 1', 'Option 2'] } : {}),
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<RegistrationField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;
    
    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    const newFields = [...fields];
    [newFields[fieldIndex], newFields[newIndex]] = [newFields[newIndex], newFields[fieldIndex]];
    
    // Update order
    newFields.forEach((field, index) => {
      field.order = index;
    });
    
    setFields(newFields);
  };

  const duplicateField = (fieldId: string) => {
    const fieldToDuplicate = fields.find(f => f.id === fieldId);
    if (!fieldToDuplicate) return;
    
    const newField: RegistrationField = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}`,
      label: `${fieldToDuplicate.label} (Copy)`,
      order: fields.length,
    };
    
    setFields([...fields, newField]);
  };

  const saveFields = async () => {
    setSaving(true);
    try {
      // Update event with new registration fields
      await apiClient.updateEvent(eventId, {
        registrationFields: {
          fields: fields.map((field, index) => ({ ...field, order: index }))
        }
      });
      onSave?.(fields);
    } catch (error) {
      console.error('Failed to save registration fields:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderFieldPreview = (field: RegistrationField) => {
    const commonProps = {
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
      placeholder: field.placeholder,
      required: field.required,
      disabled: true,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return <input {...commonProps} type={field.type} />;
      case 'textarea':
        return <textarea {...commonProps} rows={3} />;
      case 'number':
        return <input {...commonProps} type="number" />;
      case 'date':
        return <input {...commonProps} type="date" />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center space-x-2">
                <input type="radio" name={field.id} disabled className="border-gray-300" />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input type="checkbox" disabled className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
          </div>
        );
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  const renderFieldEditor = (field: RegistrationField) => {
    const fieldTypeInfo = FIELD_TYPES.find(t => t.type === field.type);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {fieldTypeInfo?.icon && (
              <fieldTypeInfo.icon className="h-5 w-5 text-gray-500" />
            )}
            <h3 className="font-medium text-gray-900">{field.label}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateField(field.id, { visible: !field.visible })}
              className={`p-1 rounded ${field.visible ? 'text-green-600' : 'text-gray-400'}`}
              title={field.visible ? 'Hide field' : 'Show field'}
            >
              {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => duplicateField(field.id)}
              className="p-1 text-gray-600 hover:text-blue-600"
              title="Duplicate field"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteField(field.id)}
              className="p-1 text-gray-600 hover:text-red-600"
              title="Delete field"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Type
            </label>
            <select
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {FIELD_TYPES.map(type => (
                <option key={type.type} value={type.type}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder Text
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Help Text
          </label>
          <input
            type="text"
            value={field.helpText || ''}
            onChange={(e) => updateField(field.id, { helpText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Optional help text for users"
          />
        </div>

        {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[index] = e.target.value;
                      updateField(field.id, { options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => {
                      const newOptions = field.options?.filter((_, i) => i !== index);
                      updateField(field.id, { options: newOptions });
                    }}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                  updateField(field.id, { options: newOptions });
                }}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Option
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Required field</span>
          </label>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => moveField(field.id, 'up')}
              disabled={field.order === 0}
              className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
              title="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => moveField(field.id, 'down')}
              disabled={field.order === fields.length - 1}
              className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
              title="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Form Builder</h1>
          <p className="text-gray-600">Create custom registration fields for your event</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={saveFields}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Form'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Types Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Field</h2>
            <div className="space-y-2">
              {FIELD_TYPES.map(fieldType => (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type)}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center space-x-3"
                >
                  <fieldType.icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{fieldType.label}</div>
                    <div className="text-sm text-gray-500">{fieldType.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Builder Panel */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-500 mb-4">
                  <Settings className="h-12 w-12 mx-auto mb-2" />
                  <p>No fields added yet</p>
                  <p className="text-sm">Click on a field type to get started</p>
                </div>
              </div>
            ) : (
              fields
                .sort((a, b) => a.order - b.order)
                .map(field => (
                  <div key={field.id} className="relative">
                    {selectedField === field.id ? (
                      renderFieldEditor(field)
                    ) : (
                      <div 
                        onClick={() => setSelectedField(field.id)}
                        className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 ${
                          !field.visible ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{field.label}</h3>
                          <div className="flex items-center space-x-2">
                            {field.required && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                            )}
                            {!field.visible && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Hidden</span>
                            )}
                          </div>
                        </div>
                        {renderFieldPreview(field)}
                        {field.helpText && (
                          <p className="text-sm text-gray-500 mt-2">{field.helpText}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-6 w-6 transform rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              {fields
                .filter(field => field.visible)
                .sort((a, b) => a.order - b.order)
                .map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFieldPreview(field)}
                    {field.helpText && (
                      <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationFormBuilder;
