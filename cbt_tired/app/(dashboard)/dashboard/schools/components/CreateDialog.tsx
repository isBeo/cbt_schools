import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button, Input } from "@base-ui/react"
import { PlusCircleIcon, Send, X } from "lucide-react"

export const createDialog = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <PlusCircleIcon /> Add School
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>School Reg.</DialogTitle>
          <DialogDescription>
            Add the name and the address of the school
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="name">name of school</Label>
          <Input id="name" placeholder="enter the name of the school here..." />
        </div>
        <div>
          <Label htmlFor="address">name of school</Label>
          <Input
            id="address"
            placeholder="enter the address of the school here..."
          />
        </div>
        <DialogFooter>
          <Button>
            <Send />
            Submit
          </Button>
          <Button>
            <X /> Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default createDialog
