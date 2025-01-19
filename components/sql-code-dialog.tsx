import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, Copy } from 'lucide-react'

interface SQLCodeDialogProps {
  sqlCode: string
}

export function SQLCodeDialog({ sqlCode }: SQLCodeDialogProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">View SQL Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Generated SQL Code</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-4"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <pre className="text-sm">{sqlCode}</pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

