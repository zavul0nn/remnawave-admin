import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Trash2, UsersRound, Globe, Hash } from 'lucide-react'
import { squadsApi } from '@/api/squads'
import { usePermissionStore } from '@/store/permissionStore'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryError } from '@/components/QueryError'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useTabParam } from '@/lib/useTabParam'

const VALID_TABS = ['internal', 'external'] as const

function InternalSquadsTab() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const hasPermission = usePermissionStore((s) => s.hasPermission)
  const canCreate = hasPermission('users', 'create')
  const canDelete = hasPermission('users', 'delete')

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null)

  const { data: squads = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['squads-internal'],
    queryFn: squadsApi.listInternal,
  })

  const createMut = useMutation({
    mutationFn: () => squadsApi.createInternal(newName.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads-internal'] })
      qc.invalidateQueries({ queryKey: ['internal-squads'] })
      setCreateOpen(false)
      setNewName('')
      toast.success(t('squads.created', { defaultValue: 'Squad created' }))
    },
    onError: () => toast.error(t('common.error')),
  })

  const deleteMut = useMutation({
    mutationFn: (uuid: string) => squadsApi.deleteInternal(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads-internal'] })
      qc.invalidateQueries({ queryKey: ['internal-squads'] })
      setDeleteUuid(null)
      toast.success(t('squads.deleted', { defaultValue: 'Squad deleted' }))
    },
    onError: () => toast.error(t('common.error')),
  })

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (isError) return <QueryError onRetry={refetch} />

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            {t('squads.createInternal', { defaultValue: 'Create Internal Squad' })}
          </Button>
        </div>
      )}

      {!squads.length ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          {t('squads.noInternal', { defaultValue: 'No internal squads' })}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {squads.map((sq) => (
            <Card key={sq.uuid} className="animate-fade-in-up">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <UsersRound className="w-4 h-4 text-primary-400 shrink-0" />
                    <span className="font-medium text-white truncate">{sq.name}</span>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-400"
                      onClick={() => setDeleteUuid(sq.uuid)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  {sq.info && (
                    <>
                      <span className="flex items-center gap-1">
                        <UsersRound className="w-3 h-3" />
                        {sq.info.membersCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {sq.info.inboundsCount} inbounds
                      </span>
                    </>
                  )}
                </div>
                {sq.inbounds && sq.inbounds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sq.inbounds.map((ib) => (
                      <Badge key={ib.uuid} variant="outline" className="text-[10px]">
                        {ib.tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('squads.createInternal', { defaultValue: 'Create Internal Squad' })}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t('squads.name', { defaultValue: 'Squad name' })}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={30}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={() => createMut.mutate()}
              disabled={!newName.trim() || createMut.isPending}
            >
              {t('common.create', { defaultValue: 'Create' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteUuid}
        onOpenChange={(open) => !open && setDeleteUuid(null)}
        onConfirm={() => deleteUuid && deleteMut.mutate(deleteUuid)}
        title={t('squads.deleteConfirm', { defaultValue: 'Delete squad?' })}
        description={t('squads.deleteDescription', { defaultValue: 'This will remove the squad. Users will be unassigned.' })}
        variant="destructive"
      />
    </div>
  )
}

function ExternalSquadsTab() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const hasPermission = usePermissionStore((s) => s.hasPermission)
  const canCreate = hasPermission('users', 'create')
  const canDelete = hasPermission('users', 'delete')

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null)

  const { data: squads = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['squads-external'],
    queryFn: squadsApi.listExternal,
  })

  const createMut = useMutation({
    mutationFn: () => squadsApi.createExternal(newName.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads-external'] })
      qc.invalidateQueries({ queryKey: ['external-squads'] })
      setCreateOpen(false)
      setNewName('')
      toast.success(t('squads.created', { defaultValue: 'Squad created' }))
    },
    onError: () => toast.error(t('common.error')),
  })

  const deleteMut = useMutation({
    mutationFn: (uuid: string) => squadsApi.deleteExternal(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads-external'] })
      qc.invalidateQueries({ queryKey: ['external-squads'] })
      setDeleteUuid(null)
      toast.success(t('squads.deleted', { defaultValue: 'Squad deleted' }))
    },
    onError: () => toast.error(t('common.error')),
  })

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (isError) return <QueryError onRetry={refetch} />

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            {t('squads.createExternal', { defaultValue: 'Create External Squad' })}
          </Button>
        </div>
      )}

      {!squads.length ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          {t('squads.noExternal', { defaultValue: 'No external squads' })}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {squads.map((sq) => (
            <Card key={sq.uuid} className="animate-fade-in-up">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-medium text-white truncate">{sq.name}</span>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-400"
                      onClick={() => setDeleteUuid(sq.uuid)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                {sq.info && (
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UsersRound className="w-3 h-3" />
                      {sq.info.membersCount} {t('squads.members', { defaultValue: 'members' })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('squads.createExternal', { defaultValue: 'Create External Squad' })}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t('squads.name', { defaultValue: 'Squad name' })}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={30}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={() => createMut.mutate()}
              disabled={!newName.trim() || createMut.isPending}
            >
              {t('common.create', { defaultValue: 'Create' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteUuid}
        onOpenChange={(open) => !open && setDeleteUuid(null)}
        onConfirm={() => deleteUuid && deleteMut.mutate(deleteUuid)}
        title={t('squads.deleteConfirm', { defaultValue: 'Delete squad?' })}
        description={t('squads.deleteDescription', { defaultValue: 'This will remove the squad. Users will be unassigned.' })}
        variant="destructive"
      />
    </div>
  )
}

export default function Squads() {
  const { t } = useTranslation()
  const hasPermission = usePermissionStore((s) => s.hasPermission)
  const [tab, setTab] = useTabParam('internal', [...VALID_TABS])

  if (!hasPermission('users', 'view')) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t('common.noPermission', { defaultValue: 'No permission' })}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('squads.title', { defaultValue: 'Squads' })}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('squads.subtitle', { defaultValue: 'Manage internal and external squads for user grouping' })}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="internal" className="gap-1.5">
            <UsersRound className="w-4 h-4" />
            {t('squads.internal', { defaultValue: 'Internal' })}
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-1.5">
            <Globe className="w-4 h-4" />
            {t('squads.external', { defaultValue: 'External' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
          <InternalSquadsTab />
        </TabsContent>

        <TabsContent value="external">
          <ExternalSquadsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
