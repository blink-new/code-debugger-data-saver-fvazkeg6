import { User } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileText, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface NotesViewProps {
  user: User;
}

export function NotesView({ user }: NotesViewProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground">
            Create and organize markdown notes with live preview
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Markdown Notes Editor
          </CardTitle>
          <CardDescription>
            Rich markdown editor with live preview and formatting toolbar (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Markdown Editor Coming Soon
            </h3>
            <p className="text-muted-foreground">
              Professional markdown editor with live preview and formatting support
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}