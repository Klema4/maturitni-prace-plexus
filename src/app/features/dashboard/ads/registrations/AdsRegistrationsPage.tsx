"use client";

import { Check, Filter, Loader2, XCircle } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { Textarea } from "@/components/ui/dashboard/Inputs";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import NoData from "@/components/ui/dashboard/NoData";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { useAdsRegistrationsPage } from "./hooks/useAdsRegistrationsPage";

export default function AdsRegistrationsPage() {
  const {
    filteredApplications,
    loading,
    error,
    filterStatus,
    processingId,
    isRejectModalOpen,
    rejectId,
    rejectionReason,
    setRejectionReason,
    toggleFilterStatus,
    openRejectModal,
    closeRejectModal,
    handleApprove,
    handleReject,
  } = useAdsRegistrationsPage();

  return (
    <>
      <header>
        <Heading variant="h1">Firemní registrace</Heading>
        <Paragraph>Spravuj žádosti firem o vstup do reklamní sítě.</Paragraph>
      </header>

      <QuickOptions
        options={[
          {
            label:
              filterStatus === "all"
                ? "Všechny žádosti"
                : filterStatus === "submitted"
                  ? "Jen nové žádosti"
                  : "Filtrovat podle stavu",
            icon: Filter,
            onClick: toggleFilterStatus,
            variant: "secondary",
          },
        ]}
      />

      {error ? (
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 flex items-center justify-center">
          <Paragraph color="muted">
            <Loader2 className="mr-2 inline-block animate-spin" size={16} />
            Načítám žádosti…
          </Paragraph>
        </div>
      ) : filteredApplications.length === 0 ? (
        <NoData />
      ) : (
        <section className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map((application) => (
              <Card key={application.id}>
                <Heading variant="h4">{application.companyName}</Heading>
                <Paragraph size="small" color="muted">
                  {application.location}
                </Paragraph>
                <div className="mt-1 space-y-1 text-sm tracking-tight text-zinc-300">
                  <p>
                    E-mail:{" "}
                    <span className="font-semibold text-white">
                      {application.email}
                    </span>
                  </p>
                  <p>
                    Telefon:{" "}
                    <span className="font-semibold text-white">
                      {application.phone}
                    </span>
                  </p>
                  <p>
                    IČO:{" "}
                    {application.ico ? (
                      <span className="font-semibold text-white">
                        {application.ico}
                      </span>
                    ) : (
                      <span className="text-zinc-500">neuvedeno</span>
                    )}
                  </p>
                  <p>
                    Odesláno:{" "}
                    <span className="font-semibold text-white">
                      {new Date(application.submittedAt).toLocaleString(
                        "cs-CZ",
                      )}
                    </span>
                  </p>
                </div>

                {application.rejectionReason ? (
                  <div className="mt-2 text-xs text-rose-400">
                    Důvod zamítnutí: {application.rejectionReason}
                  </div>
                ) : null}

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="danger"
                    onClick={() => openRejectModal(application.id)}
                    disabled={
                      processingId === application.id ||
                      application.status !== "submitted"
                    }
                  >
                    <XCircle size={16} />
                    Zamítnout
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => void handleApprove(application.id)}
                    disabled={
                      processingId === application.id ||
                      application.status !== "submitted"
                    }
                  >
                    <Check size={16} />
                    Schválit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Modal
        isOpen={isRejectModalOpen}
        onClose={closeRejectModal}
      >
        <ModalHeader onClose={closeRejectModal}>
          Zamítnutí žádosti
        </ModalHeader>
        <ModalBody>
          <Textarea
            label="Zadej důvod zamítnutí (zobrazí se žadateli):"
            placeholder="Např. Neúplné údaje, neaktivní web..."
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={closeRejectModal}>
            Zrušit
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleReject()}
            disabled={!rejectionReason.trim() || processingId === rejectId}
          >
            {processingId === rejectId ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <XCircle size={16} />
            )}
            Zamítnout
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
