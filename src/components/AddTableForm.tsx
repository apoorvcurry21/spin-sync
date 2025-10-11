import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Table {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  description: string | null;
  created_by: string;
}

interface AddTableFormProps {
  onSuccess: () => void;
  tableToEdit?: Table | null;
}

export const AddTableForm = ({ onSuccess, tableToEdit }: AddTableFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tableToEdit) {
      setName(tableToEdit.name);
      setAddress(tableToEdit.address);
      setCity(tableToEdit.city);
      setDescription(tableToEdit.description || '');
    }
  }, [tableToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tableData = {
      name,
      address,
      city,
      description,
      latitude: tableToEdit?.latitude || 0, // Keep existing or use placeholder
      longitude: tableToEdit?.longitude || 0, // Keep existing or use placeholder
      created_by: user?.id,
    };

    let error;

    if (tableToEdit) {
      // Update existing table
      const { error: updateError } = await supabase
        .from('ping_pong_tables')
        .update(tableData)
        .match({ id: tableToEdit.id });
      error = updateError;
    } else {
      // Insert new table
      const { error: insertError } = await supabase
        .from('ping_pong_tables')
        .insert([tableData]);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving table:', error);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Venue Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City
        </label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? tableToEdit
            ? 'Updating Table...'
            : 'Adding Table...'
          : tableToEdit
          ? 'Update Table'
          : 'Add Table'}
      </Button>
    </form>
  );
};
