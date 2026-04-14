"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveAdminRegistration,
  listAdminRegistrations,
  rejectAdminRegistration,
} from "../../api/ads.api";
import type {
  AdminOrganizationApplication,
  AdminRegistrationStatus,
} from "../../types";

export function useAdsRegistrationsPage() {
  const [applications, setApplications] = useState<
    AdminOrganizationApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    AdminRegistrationStatus | "all"
  >("submitted");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setApplications(await listAdminRegistrations(filterStatus));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nastala chyba při načítání žádostí",
      );
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const openRejectModal = useCallback((id: string) => {
    setRejectId(id);
    setIsRejectModalOpen(true);
  }, []);

  const closeRejectModal = useCallback(() => {
    setIsRejectModalOpen(false);
    setRejectId(null);
    setRejectionReason("");
  }, []);

  const handleApprove = useCallback(async (id: string) => {
    setProcessingId(id);
    setError(null);

    try {
      await approveAdminRegistration(id);
      setApplications((current) =>
        current.map((application) =>
          application.id === id
            ? {
                ...application,
                status: "approved",
                reviewedAt: new Date().toISOString(),
                rejectionReason: null,
              }
            : application,
        ),
      );
    } catch (approveError) {
      setError(
        approveError instanceof Error
          ? approveError.message
          : "Nepodařilo se schválit žádost",
      );
    } finally {
      setProcessingId(null);
    }
  }, []);

  const handleReject = useCallback(async () => {
    if (!rejectId) {
      return;
    }

    setProcessingId(rejectId);
    setError(null);

    try {
      const trimmedReason = rejectionReason.trim();
      await rejectAdminRegistration(rejectId, trimmedReason);
      setApplications((current) =>
        current.map((application) =>
          application.id === rejectId
            ? {
                ...application,
                status: "rejected",
                reviewedAt: new Date().toISOString(),
                rejectionReason: trimmedReason,
              }
            : application,
        ),
      );
      closeRejectModal();
    } catch (rejectError) {
      setError(
        rejectError instanceof Error
          ? rejectError.message
          : "Nepodařilo se zamítnout žádost",
      );
    } finally {
      setProcessingId(null);
    }
  }, [closeRejectModal, rejectionReason, rejectId]);

  const toggleFilterStatus = useCallback(() => {
    setFilterStatus((current) => (current === "submitted" ? "all" : "submitted"));
  }, []);

  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => application.status === "submitted"),
    [applications],
  );

  return {
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
  };
}
