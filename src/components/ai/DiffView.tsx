import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, AlertCircle, PlusCircle, MinusCircle } from 'lucide-react';

type ChangeStatus = 'new' | 'modified' | 'removed' | 'unchanged';

type DiffFieldProps = {
  label: string;
  currentValue: string | string[] | number | null | undefined;
  newValue: string | string[] | number | null | undefined;
  status: ChangeStatus;
};

type DiffViewProps = {
  title: string;
  changes: Array<{
    id: string;
    status: ChangeStatus;
    fields: DiffFieldProps[];
  }>;
  maxHeight?: string;
};

const getStatusColor = (status: ChangeStatus) => {
  switch (status) {
    case 'new':
      return 'text-green-600';
    case 'modified':
      return 'text-amber-600';
    case 'removed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusBadge = (status: ChangeStatus) => {
  switch (status) {
    case 'new':
      return <Badge className="bg-green-100 text-green-800">New</Badge>;
    case 'modified':
      return <Badge className="bg-amber-100 text-amber-800">Modified</Badge>;
    case 'removed':
      return <Badge className="bg-red-100 text-red-800">Removed</Badge>;
    default:
      return null;
  }
};

const getStatusIcon = (status: ChangeStatus) => {
  switch (status) {
    case 'new':
      return <PlusCircle className="h-4 w-4 text-green-600" />;
    case 'modified':
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    case 'removed':
      return <MinusCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const formatValue = (value: string | string[] | number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
};

const DiffField: React.FC<DiffFieldProps> = ({ label, currentValue, newValue, status }) => {
  if (status === 'unchanged') {
    return (
      <div className="py-2">
        <div className="text-sm font-medium text-gray-600">{label}</div>
        <div className="text-base">{formatValue(currentValue)}</div>
      </div>
    );
  }

  return (
    <div className={`py-2 ${status === 'removed' ? 'opacity-70' : ''}`}>
      <div className="text-sm font-medium text-gray-600 flex items-center">
        {label}
        <span className="ml-2">{getStatusIcon(status)}</span>
      </div>
      
      {status === 'modified' ? (
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="text-sm bg-red-50 p-2 rounded line-through text-red-700">
            {formatValue(currentValue)}
          </div>
          <div className="text-sm bg-green-50 p-2 rounded text-green-700">
            {formatValue(newValue)}
          </div>
        </div>
      ) : status === 'new' ? (
        <div className="text-base text-green-700">{formatValue(newValue)}</div>
      ) : (
        <div className="text-base text-red-700 line-through">{formatValue(currentValue)}</div>
      )}
    </div>
  );
};

export const DiffView: React.FC<DiffViewProps> = ({ title, changes, maxHeight = '500px' }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <ScrollArea className={`w-full pr-4`} style={{ maxHeight }}>
          <div className="space-y-6">
            {changes.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 border rounded-md ${
                  item.status === 'new' ? 'border-l-4 border-green-500' :
                  item.status === 'modified' ? 'border-l-4 border-amber-500' :
                  item.status === 'removed' ? 'border-l-4 border-red-500 opacity-80' :
                  'border-gray-200'
                }`}
              >
                <div className="mb-2 flex justify-between items-center">
                  <h4 className={`font-medium ${getStatusColor(item.status)}`}>
                    Item {item.id.substring(0, 6)}
                  </h4>
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="space-y-2 divide-y">
                  {item.fields.map((field, index) => (
                    <DiffField
                      key={`${item.id}-${index}-${field.label}`}
                      label={field.label}
                      currentValue={field.currentValue}
                      newValue={field.newValue}
                      status={field.status}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {changes.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No changes detected</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export const DiffTable: React.FC<{
  title: string;
  headers: string[];
  rows: Array<{
    id: string;
    status: ChangeStatus;
    cells: Array<{
      currentValue: string | string[] | number | null | undefined;
      newValue: string | string[] | number | null | undefined;
      status: ChangeStatus;
    }>;
  }>;
  maxHeight?: string;
}> = ({ title, headers, rows, maxHeight = '500px' }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <ScrollArea className={`w-full`} style={{ maxHeight }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow 
                  key={row.id}
                  className={`${
                    row.status === 'new' ? 'bg-green-50' :
                    row.status === 'modified' ? 'bg-amber-50' :
                    row.status === 'removed' ? 'bg-red-50' : ''
                  }`}
                >
                  <TableCell>
                    {getStatusIcon(row.status)}
                  </TableCell>
                  
                  {row.cells.map((cell, index) => (
                    <TableCell key={`${row.id}-cell-${index}`}>
                      {cell.status === 'modified' ? (
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-red-700 line-through">
                            {formatValue(cell.currentValue)}
                          </div>
                          <div className="text-xs text-green-700">
                            {formatValue(cell.newValue)}
                          </div>
                        </div>
                      ) : row.status === 'new' ? (
                        <div className="text-green-700">{formatValue(cell.newValue)}</div>
                      ) : row.status === 'removed' ? (
                        <div className="text-red-700 line-through">{formatValue(cell.currentValue)}</div>
                      ) : (
                        formatValue(cell.currentValue)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={headers.length + 1} className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No changes detected</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 