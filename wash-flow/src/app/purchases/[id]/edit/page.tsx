import PurchaseFormPage from '@/components/purchases/PurchaseFormPage'

export default function EditPurchasePage({
  params,
}: {
  params: { id: string }
}) {
  return <PurchaseFormPage mode="edit" id={params.id} />
}
