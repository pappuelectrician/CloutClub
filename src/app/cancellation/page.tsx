import React from 'react';

export const metadata = {
    title: 'Cancellation Policy',
    description: 'Cancellation policy for Clout Club.'
};

export default function CancellationPage() {
    return (
        <div style={{ paddingTop: '150px', paddingBottom: '100px', paddingLeft: '5%', paddingRight: '5%', minHeight: '100vh', background: 'var(--background)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Cancellation Policy</h1>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>Placeholder text for Cancellation Policy. Replace this with the actual legal content.</p>
        </div>
    );
}
