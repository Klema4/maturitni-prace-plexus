"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, MessageSquare, Search } from "lucide-react";
import NoData from "@/components/ui/dashboard/NoData";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Card } from "@/components/ui/dashboard/Card";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import Pagination from "@/components/ui/dashboard/Pagination";
import { CommentRow } from "./components/CommentRow";
import { useCommentsPage } from "./hooks/useCommentsPage";
import { CommentsFiltersModal } from "./components/CommentsFiltersModal";
import { CommentsSearchModal } from "./components/CommentsSearchModal";

export default function CommentsModerationPage() {
  const {
    comments,
    loading,
    error,
    query,
    setQuery,
    total,
    page,
    setPage,
    perPage,
    setPerPage,
    totalPages,
    handleHide,
    handleUnhide,
    handleBanUser,
    handleEditAsAdmin,
    handleDelete,
  } = useCommentsPage();

  const [onlyReported, setOnlyReported] = useState(false);
  const [hideHidden, setHideHidden] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draftQuery, setDraftQuery] = useState(query);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  const stats = useMemo(() => {
    const hidden = comments.filter((comment) => comment.isHidden).length;
    const reported = comments.filter((comment) => (comment.reportsCount ?? 0) > 0).length;
    return { hidden, reported };
  }, [comments]);

  const filteredComments = useMemo(() => {
    return comments
      .filter((comment) => (hideHidden ? !comment.isHidden : true))
      .filter((comment) => (onlyReported ? (comment.reportsCount ?? 0) > 0 : true));
  }, [comments, hideHidden, onlyReported]);

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Komentáře</Heading>
          <Paragraph>Všechny komentáře na platformě.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám komentáře...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Komentáře</Heading>
          <Paragraph>Všechny komentáře na platformě.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Komentáře</Heading>
        <Paragraph>Všechny komentáře na platformě.</Paragraph>
      </header>
      <QuickOptions
        options={[
          {
            label: "Vyhledat",
            variant: "outline",
            icon: Search,
            onClick: () => setIsSearchOpen(true),
          },
          {
            label: "Filtrovat",
            variant: "outline",
            icon: Filter,
            onClick: () => setIsFiltersOpen(true),
          },
          {
            label: "Reporty",
            variant: "primary",
            icon: MessageSquare,
            link: "/dashboard/reports",
          },
        ]}
      />
      <section className="mt-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <Heading variant="h3" className="mb-2">
              Seznam
            </Heading>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium tracking-tight text-zinc-400">
              <span className="rounded bg-zinc-800/60 px-2 py-1">
                Celkem: <span className="text-white">{total}</span>
              </span>
              <span className="rounded bg-yellow-500/10 px-2 py-1 text-yellow-300">
                Skryté: <span className="text-white">{stats.hidden}</span>
              </span>
              <span className="rounded bg-red-500/10 px-2 py-1 text-red-300">
                Reportované: <span className="text-white">{stats.reported}</span>
              </span>
              {query ? (
                <span className="rounded bg-zinc-800/60 px-2 py-1">
                  Hledat: <span className="text-white">{query}</span>
                </span>
              ) : null}
              <span className="ml-auto text-zinc-500">
                Zobrazeno: <span className="text-white">{filteredComments.length}</span>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-4">
        <Card padding="compact" className="p-4!">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </Card>
      </section>
      <section className="mt-4">
        <Card padding="compact">
          {filteredComments.length === 0 ? (
            <NoData />
          ) : (
            <div className="p-2 lg:p-3">
              {filteredComments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  onHide={handleHide}
                  onUnhide={handleUnhide}
                  onBanUser={handleBanUser}
                  onEditAsAdmin={handleEditAsAdmin}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </Card>
      </section>
      <section className="mt-4">
        <Card padding="compact" className="p-4!">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </Card>
      </section>

      <CommentsFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onlyReported={onlyReported}
        onOnlyReportedChange={setOnlyReported}
        hideHidden={hideHidden}
        onHideHiddenChange={setHideHidden}
      />

      <CommentsSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        value={draftQuery}
        onChange={setDraftQuery}
        onClear={() => {
          setDraftQuery("");
          setQuery("");
        }}
        onSubmit={() => {
          setQuery(draftQuery);
          setIsSearchOpen(false);
        }}
      />
    </>
  );
}
