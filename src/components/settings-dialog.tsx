'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Upload, Settings, Trash2, RefreshCcw } from "lucide-react"
import { useHistory } from "@/hooks/use-history.tsx"
import { useSettings } from "@/hooks/use-settings.tsx"
import { useToast } from "@/hooks/use-toast"
import { defaultBanks } from "@/lib/banks"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ChangeEvent, useRef } from "react"
import type { HistoryRecord } from "@/lib/types"

export function SettingsDialog() {
    const { history, setHistory, clearHistory } = useHistory();
    const [settings, setSettings] = useSettings();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataToExport = {
            settings,
            history
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `profit-pakistan-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Data Exported", description: "Your settings and history have been exported." });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const importedData = JSON.parse(text);
                        if (importedData.settings && importedData.history) {
                            // Basic validation
                            if (Array.isArray(importedData.history)) {
                                 const newHistory: HistoryRecord[] = [...history];
                                 const importedHistory: HistoryRecord[] = importedData.history;
                                 
                                 importedHistory.forEach(importedRecord => {
                                    if(!newHistory.find(h => h.id === importedRecord.id)) {
                                        newHistory.push(importedRecord);
                                    }
                                 });

                                setHistory(newHistory);
                            }
                            if (typeof importedData.settings === 'object') {
                                setSettings(importedData.settings);
                            }
                            toast({ title: "Import Successful", description: "Your settings and history have been restored." });
                        } else {
                            throw new Error("Invalid backup file format.");
                        }
                    }
                } catch (error) {
                    toast({ title: "Import Failed", description: "The selected file is not a valid backup file.", variant: "destructive" });
                    console.error("Import error:", error);
                }
            };
            reader.readAsText(file);
        }
        // Reset file input to allow importing the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleResetBanks = () => {
        setSettings(prev => ({...prev, banks: defaultBanks }));
        toast({ title: "Bank Rates Reset", description: "Bank rates have been reset to their default values." });
    };

    const handleClearHistory = () => {
        if (confirm("Are you sure you want to delete all saved reports? This action cannot be undone.")) {
            clearHistory();
            toast({ title: "History Cleared", description: "All saved reports have been deleted." });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings & Data</DialogTitle>
                    <DialogDescription>
                        Manage your application data and preferences.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Data Management</Label>
                        <div className="grid grid-cols-2 gap-2">
                             <Button onClick={handleExport} variant="outline"><Download className="mr-2 h-4 w-4" /> Export Data</Button>
                             <Button onClick={handleImportClick} variant="outline"><Upload className="mr-2 h-4 w-4" /> Import Data</Button>
                             <Input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Bank Rates</Label>
                        <Button onClick={handleResetBanks} variant="outline" className="w-full justify-start"><RefreshCcw className="mr-2 h-4 w-4" /> Reset to Defaults</Button>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-destructive">Danger Zone</Label>
                        <Button onClick={handleClearHistory} variant="destructive" className="w-full justify-start"><Trash2 className="mr-2 h-4 w-4" /> Clear All Reports</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
