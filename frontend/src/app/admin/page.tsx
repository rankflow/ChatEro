'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Avatar {
  id: string;
  name: string;
  description: string;
  personality: string;
  imageUrl: string;
  isPremium: boolean;
  category: string;
  isActive: boolean;
  background?: string;
  origin?: string;
  age?: number;
  occupation?: string;
  interests?: string;
  fears?: string;
  dreams?: string;
  secrets?: string;
  relationships?: string;
  lifeExperiences?: string;
  personalityTraits?: string;
  communicationStyle?: string;
  emotionalState?: string;
  motivations?: string;
  conflicts?: string;
  growth?: string;
  voiceType?: string;
  accent?: string;
  mannerisms?: string;
  style?: string;
  scent?: string;
  chatStyle?: string;
  topics?: string;
  boundaries?: string;
  kinks?: string;
  roleplay?: string;
}

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'http://TU_IP_LOCAL_O_SERVIDOR:3001';

export default function AdminPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  // Verificar token de administrador
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      const inputToken = prompt('Ingresa el token de administrador:');
      if (inputToken) {
        localStorage.setItem('adminToken', inputToken);
        setAdminToken(inputToken);
      } else {
        router.push('/');
        return;
      }
    } else {
      setAdminToken(token);
    }
  }, [router]);

  // Cargar avatares
  useEffect(() => {
    if (adminToken) {
      fetchAvatars();
    }
  }, [adminToken]);

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/avatars`, {
        headers: {
          'x-admin-token': adminToken
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar avatares');
      }

      const data = await response.json();
      setAvatars(data.avatars);
    } catch (err) {
      setError('Error al cargar avatares');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedAvatar({
      id: '',
      name: '',
      description: '',
      personality: '',
      imageUrl: '',
      isPremium: false,
      category: 'general',
      isActive: true,
      background: '',
      origin: '',
      age: undefined,
      occupation: '',
      interests: '',
      fears: '',
      dreams: '',
      secrets: '',
      relationships: '',
      lifeExperiences: '',
      personalityTraits: '',
      communicationStyle: '',
      emotionalState: '',
      motivations: '',
      conflicts: '',
      growth: '',
      voiceType: '',
      accent: '',
      mannerisms: '',
      style: '',
      scent: '',
      chatStyle: '',
      topics: '',
      boundaries: '',
      kinks: '',
      roleplay: ''
    });
    setIsCreating(true);
    setIsEditing(false);
    setFormKey(prev => prev + 1);
  };

  const handleSave = async (avatarData: Avatar) => {
    try {
      const url = isCreating 
        ? `${API_BASE}/api/admin/avatars`
        : `${API_BASE}/api/admin/avatars/${avatarData.id}`;
      
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(avatarData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar avatar');
      }

      await fetchAvatars();
      setSelectedAvatar(null);
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      setError('Error al guardar avatar');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este avatar?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/avatars/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar avatar');
      }

      await fetchAvatars();
    } catch (err) {
      setError('Error al eliminar avatar');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración - Personajes
            </h1>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear Nuevo Personaje
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de avatares */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Personajes Existentes</h2>
              <div className="space-y-3">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{avatar.name}</h3>
                        <p className="text-sm text-gray-600">{avatar.category}</p>
                        <div className="flex gap-2 mt-2">
                          {avatar.isPremium && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Premium
                            </span>
                          )}
                          {avatar.isActive ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Activo
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              Inactivo
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(avatar)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(avatar.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulario de edición/creación */}
            {(isEditing || isCreating) && selectedAvatar && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">
                  {isCreating ? 'Crear Nuevo Personaje' : 'Editar Personaje'}
                </h2>
                <AvatarForm
                  key={formKey}
                  avatar={selectedAvatar}
                  onSave={handleSave}
                  onCancel={() => {
                    setSelectedAvatar(null);
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AvatarFormProps {
  avatar: Avatar;
  onSave: (avatar: Avatar) => void;
  onCancel: () => void;
}

function AvatarForm({ avatar, onSave, onCancel }: AvatarFormProps) {
  const [formData, setFormData] = useState<Avatar>(avatar);
  const [isAutocompleting, setIsAutocompleting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Avatar, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAutocomplete = async () => {
    try {
      setIsAutocompleting(true);
      
      const response = await fetch(`${API_BASE}/api/admin/avatars/autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ partialAvatar: formData })
      });

      if (!response.ok) {
        throw new Error('Error al autocompletar con IA');
      }

      const data = await response.json();
      setFormData(data.avatar);
    } catch (error) {
      console.error('Error en autocompletado:', error);
      alert('Error al autocompletar con IA. Asegúrate de que el servidor Mistral esté disponible.');
    } finally {
      setIsAutocompleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
            URL de Imagen
          </label>
          <input
            id="imageUrl"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.imageUrl || ''}
            onChange={e => handleChange('imageUrl', e.target.value)}
            placeholder="URL o ruta relativa de la imagen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edad
          </label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Personalidad
        </label>
        <textarea
          value={formData.personality}
          onChange={(e) => handleChange('personality', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trasfondo
        </label>
        <textarea
          value={formData.background || ''}
          onChange={(e) => handleChange('background', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Intereses
        </label>
        <textarea
          value={formData.interests || ''}
          onChange={(e) => handleChange('interests', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experiencias de Vida
        </label>
        <textarea
          value={formData.lifeExperiences || ''}
          onChange={(e) => handleChange('lifeExperiences', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isPremium}
            onChange={(e) => handleChange('isPremium', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Premium</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Activo</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          {formData.id ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={handleAutocomplete}
          disabled={isAutocompleting}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
        >
          {isAutocompleting ? 'Autocompletando...' : 'Autocompletar con IA'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
} 