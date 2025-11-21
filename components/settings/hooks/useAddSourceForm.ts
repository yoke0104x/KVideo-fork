/**
 * Form hook for AddSourceModal
 */

'use client';

import { useState, useEffect } from 'react';
import type { VideoSource } from '@/lib/types';

interface UseAddSourceFormProps {
    isOpen: boolean;
    existingIds: string[];
    onAdd: (source: VideoSource) => void;
    onClose: () => void;
}

export function useAddSourceForm({ isOpen, existingIds, onAdd, onClose }: UseAddSourceFormProps) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setUrl('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !url.trim()) {
            setError('请填写所有字段');
            return;
        }

        try {
            new URL(url);
        } catch {
            setError('请输入有效的 URL');
            return;
        }

        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (existingIds.includes(id)) {
            setError('此源名称已存在');
            return;
        }

        const newSource: VideoSource = {
            id,
            name: name.trim(),
            baseUrl: url.trim(),
            searchPath: '',
            detailPath: '',
            enabled: true,
            priority: existingIds.length + 1,
        };

        onAdd(newSource);
        onClose();
    };

    return {
        name,
        setName,
        url,
        setUrl,
        error,
        handleSubmit,
    };
}
