import { supabase } from './supabase';

export async function readData<T>(tableName: string): Promise<T[]> {
    if (!supabase) {
        console.warn(`Supabase not configured. Returning empty array for ${tableName}.`);
        return [];
    }
    const { data, error } = await supabase
        .from(tableName)
        .select('*');

    if (error) {
        console.error(`Error reading from ${tableName}:`, error);
        return [];
    }
    return data as T[];
}

// In Supabase, we don't usually "overwrite" a whole table like this,
// but for the sake of keeping common patterns, this could be meaningful
// if we strictly use the individual item handlers.
export async function writeData<T>(tableName: string, data: T[]): Promise<void> {
    console.warn('writeData is not natively supported in Supabase flow. Use addItem/updateItem instead.');
}

export async function updateItem<T extends { id: string }>(
    tableName: string,
    id: string,
    updates: Partial<T>
): Promise<T | null> {
    const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`Error updating ${tableName}:`, error);
        return null;
    }
    return data as T;
}

export async function deleteItem<T extends { id: string }>(
    tableName: string,
    id: string
): Promise<boolean> {
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        return false;
    }
    return true;
}

export async function addItem<T extends { id: string }>(
    tableName: string,
    item: T
): Promise<T> {
    const { data, error } = await supabase
        .from(tableName)
        .insert(item)
        .select()
        .single();

    if (error) {
        console.error(`Error adding to ${tableName}:`, error);
        throw error;
    }
    return data as T;
}
