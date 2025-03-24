/**
 * Fichier d'exportation centralisé pour les composants UI
 * 
 * Ce fichier exporte tous les composants UI à partir d'un seul point d'entrée,
 * ce qui permet d'éviter les dépendances circulaires et d'améliorer l'organisation
 * des imports.
 * 
 * Usage:
 * import { Button, Card, Dialog } from "@/components/ui";
 */

// Exporter les composants de base
export { Button, buttonVariants } from './button';
export { Steps } from './steps';
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './alert-dialog';
export { AspectRatio } from './aspect-ratio';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Badge, badgeVariants } from './badge';
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './breadcrumb';
export { Calendar } from './calendar';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';
export { Checkbox } from './checkbox';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './command';
export { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuPortal, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from './context-menu';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './drawer';
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './dropdown-menu';
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';
export { useFormField } from './form';
export { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp';
export { Input } from './input';
export { Label } from './label';
export { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarPortal, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from './menubar';
export { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from './navigation-menu';
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './pagination';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export { Progress } from './progress';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './select';
export { Separator } from './separator';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
export { Sidebar, SidebarItem, SidebarSection } from './sidebar';
export { Skeleton } from './skeleton';
export { Slider } from './slider';
export { Switch } from './switch';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Textarea } from './textarea';
export { ThreeStateToggle } from './ThreeStateToggle';
export { FrenchTitle } from './FrenchTitle';
// Ne pas importer le toast depuis index.ts pour éviter les dépendances circulaires
// Au lieu de cela, exportez-le directement depuis son fichier d'origine
// export { toast } from '@/hooks/use-toast';
export { Toaster } from './toaster';
export { Toggle, toggleVariants } from './toggle';
export { ToggleGroup, ToggleGroupItem } from './toggle-group';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
