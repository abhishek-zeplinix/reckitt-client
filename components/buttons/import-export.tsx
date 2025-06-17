import { Button } from 'primereact/button'
import React from 'react'

function ImportExportButton({ onClick, label, loading, icon }: { onClick: () => void; label: string; loading?: boolean, icon: any }) {
    return (
        <Button label={label} onClick={onClick} loading={loading} icon={icon} outlined className='custom-black-text' style={{
            color: '#121212',
            borderColor: '#CBD5E1',
            backgroundColor: 'white',
        }} />

    )
}

export default ImportExportButton