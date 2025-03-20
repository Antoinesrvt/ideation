import React, { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface ValidationTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

export interface ValidationTableProps<T> {
  data: T[];
  columns: ValidationTableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  getRowId: (item: T) => string;
  onRowClick?: (item: T) => void;
  isRowClickable?: boolean;
  selectedRowId?: string | null;
  emptyState?: ReactNode;
}

export function ValidationTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  getRowId,
  onRowClick,
  isRowClickable = false,
  selectedRowId = null,
  emptyState
}: ValidationTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {(onEdit || onDelete) && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8">
                {emptyState || (
                  <div className="text-muted-foreground">
                    No data available
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow 
                key={getRowId(item)}
                className={selectedRowId === getRowId(item) ? "bg-muted/50" : ""}
                onClick={() => isRowClickable && onRowClick && onRowClick(item)}
                style={{ cursor: isRowClickable ? 'pointer' : 'default' }}
              >
                {columns.map((column, index) => (
                  <TableCell key={index} className={column.className}>
                    {column.cell 
                      ? column.cell(item)
                      : column.accessorKey 
                        ? item[column.accessorKey] as ReactNode
                        : null}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(getRowId(item));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export interface ValidationTableDetailPanelProps {
  children: ReactNode;
}

export function ValidationTableDetailPanel({ children }: ValidationTableDetailPanelProps) {
  return (
    <Card className="mt-4 border-l-4 border-l-primary animate-in slide-in-from-top-2">
      <div className="p-4">
        {children}
      </div>
    </Card>
  );
} 