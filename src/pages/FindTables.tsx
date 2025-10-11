import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { AddTableForm } from "@/components/AddTableForm";

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

const FindTables = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadTables();
    }
  }, [user]);

  const loadTables = async () => {
    const { data } = await supabase
      .from("ping_pong_tables")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setTables(data);
    }
  };

  const handleAddTableSuccess = () => {
    setIsAddTableOpen(false);
    loadTables();
  };

  const handleEditTableSuccess = () => {
    setIsEditTableOpen(false);
    setSelectedTable(null);
    loadTables();
  };

  const openEditDialog = (table: Table) => {
    setSelectedTable(table);
    setIsEditTableOpen(true);
  };

  const openDeleteDialog = (table: Table) => {
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTable) return;

    const { error } = await supabase
      .from("ping_pong_tables")
      .delete()
      .match({ id: selectedTable.id });

    if (error) {
      console.error("Error deleting table:", error);
    } else {
      loadTables();
    }
    setIsDeleteDialogOpen(false);
    setSelectedTable(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={true} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Find Tables</h1>
            <p className="text-muted-foreground">
              Discover ping pong tables near you
            </p>
          </div>
          <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new table</DialogTitle>
              </DialogHeader>
              <AddTableForm onSuccess={handleAddTableSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Map View</CardTitle>
            <CardDescription>
              Interactive map showing all table locations (Google Maps integration coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Map view coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Google Maps integration will be added in the next update
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Tables</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tables.map((table) => (
              <Card key={table.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {table.name}
                    </div>
                    {user && user.id === table.created_by && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(table)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(table)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{table.address}</p>
                  <p className="text-sm text-muted-foreground">{table.city}</p>
                  {table.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {table.description}
                    </p>
                  )}
                  <Button variant="outline" className="w-full mt-4">
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {tables.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No tables found yet. Be the first to add one!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Table Dialog */}
      <Dialog open={isEditTableOpen} onOpenChange={setIsEditTableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <AddTableForm
              onSuccess={handleEditTableSuccess}
              tableToEdit={selectedTable}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the table
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FindTables;
