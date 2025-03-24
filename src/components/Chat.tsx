
import React, { useState, useEffect } from '@/core/reactInstance';
import { MainLayout } from '@/components/chat/layout/MainLayout';

// Use functional component without props to avoid type errors
export default function Chat() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">
        <MainLayout />
      </div>
    </div>
  );
}
