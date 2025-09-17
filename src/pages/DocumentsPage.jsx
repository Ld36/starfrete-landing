import { FileText, Upload, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DocumentsPage() {
  // Mock data para demonstração
  const documents = [
    {
      id: 1,
      name: 'Contrato de Frete FR001',
      type: 'contract',
      date: '2024-01-15',
      status: 'active',
      size: '245 KB'
    },
    {
      id: 2,
      name: 'Nota Fiscal FR001',
      type: 'invoice',
      date: '2024-01-15',
      status: 'completed',
      size: '180 KB'
    },
    {
      id: 3,
      name: 'Comprovante de Entrega FR001',
      type: 'delivery',
      date: '2024-01-16',
      status: 'pending',
      size: '320 KB'
    }
  ];

  const getDocumentIcon = (type) => {
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-blue-100 text-blue-800', label: 'Ativo' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Concluído' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-500 mb-4">Faça upload de seus documentos para organizá-los aqui.</p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Data: {formatDate(doc.date)}</span>
                        <span>Tamanho: {doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(doc.status)}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
