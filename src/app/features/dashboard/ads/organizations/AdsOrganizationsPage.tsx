'use client'

import Image from "next/image";
import { Building2, Edit, Mail, MapPin, Phone, Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/dashboard/Card";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/dashboard/Modal";
import Button from "@/components/ui/dashboard/Button";
import { Input } from "@/components/ui/dashboard/Inputs";
import { getSafeImageSrc } from "@/lib/utils/image";
import { useAdsOrganizationsPage } from "./hooks/useAdsOrganizationsPage";

export default function AdsOrganizationsPage() {
  const {
    organizations,
    loading,
    error,
    isModalOpen,
    editingOrganization,
    formData,
    openModal,
    closeModal,
    updateFormField,
    handleSave,
    handleDelete,
  } = useAdsOrganizationsPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Organizace</Heading>
          <Paragraph>Spravuj reklamní organizace.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám organizace...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Organizace</Heading>
          <Paragraph>Spravuj reklamní organizace.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">{error}</Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Organizace</Heading>
        <Paragraph>Spravuj reklamní organizace.</Paragraph>
      </header>
      <QuickOptions
        options={[
          { label: "Nová organizace", variant: "primary", icon: Plus, onClick: () => openModal() },
        ]}
      />
      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {organizations.map((organization) => {
          const organizationImageSrc = getSafeImageSrc(organization.imageUrl);

          return (
            <Card key={organization.id} className="p-4!">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {organizationImageSrc ? (
                  <Image src={organizationImageSrc} alt={organization.name} width={48} height={48} className="rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
                    <Building2 size={20} />
                  </div>
                )}
                <div>
                  <Heading variant="h5">{organization.name}</Heading>
                  <Paragraph size="small">
                    {organization.activeCampaignsCount ?? 0} aktivních / {organization.totalCampaignsCount ?? 0} celkem
                  </Paragraph>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Paragraph size="small" className="flex items-center gap-2"><Mail size={14} /> {organization.email}</Paragraph>
              <Paragraph size="small" className="flex items-center gap-2"><Phone size={14} /> {organization.phone}</Paragraph>
              <Paragraph size="small" className="flex items-center gap-2"><MapPin size={14} /> {organization.location}</Paragraph>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => openModal(organization)} UseIcon={Edit}>Upravit</Button>
              <Button variant="danger" onClick={() => { void handleDelete(organization.id); }} UseIcon={Trash2}>Smazat</Button>
            </div>
            </Card>
          );
        })}
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
        <ModalHeader onClose={closeModal}>
          {editingOrganization ? "Upravit organizaci" : "Nová organizace"}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Název" value={formData.name} onChange={(event) => updateFormField("name", event.target.value)} />
            <Input label="Logo URL" value={formData.imageUrl} onChange={(event) => updateFormField("imageUrl", event.target.value)} />
            <Input label="Web" value={formData.websiteUrl} onChange={(event) => updateFormField("websiteUrl", event.target.value)} />
            <Input label="Email" value={formData.email} onChange={(event) => updateFormField("email", event.target.value)} />
            <Input label="Telefon" value={formData.phone} onChange={(event) => updateFormField("phone", event.target.value)} />
            <Input label="Lokalita" value={formData.location} onChange={(event) => updateFormField("location", event.target.value)} />
            <Input label="IČO" value={formData.ico} onChange={(event) => updateFormField("ico", event.target.value)} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeModal}>Zrušit</Button>
          <Button variant="primary" onClick={() => { void handleSave(); }} UseIcon={Save}>Uložit</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
