"use client";

import { Search } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { UserCard } from "./components/UserCard";
import { useUsersPage } from "./hooks/useUsersPage";

export default function UsersList() {
  const {
    users,
    roles,
    loading,
    error,
    searchQuery,
    showSearchModal,
    setSearchQuery,
    openSearchModal,
    closeSearchModal,
    handleSearch,
    handleClearSearch,
    handleRoleChange,
    handleBanToggle,
    handleQuotaChange,
    handleUpdateUserInfo,
  } = useUsersPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Seznam uživatelů</Heading>
          <Paragraph>Seznam s podrobnostmi a statistikami uživatelů.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám uživatele...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Seznam uživatelů</Heading>
          <Paragraph>Seznam s podrobnostmi a statistikami uživatelů.</Paragraph>
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
        <Heading variant="h1">Seznam uživatelů</Heading>
        <Paragraph>Seznam s podrobnostmi a statistikami uživatelů.</Paragraph>
      </header>
      <QuickOptions
        options={[
          {
            label: "Hledat",
            variant: "primary",
            icon: Search,
            onClick: openSearchModal,
          },
        ]}
      />
      <section className="mt-4">
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
            <Paragraph size="small" className="text-zinc-300">
              Vyhledávání: <strong>{searchQuery}</strong> ({users.length} výsledků)
            </Paragraph>
            <Button
              href="#"
              variant="outline"
              onClick={handleClearSearch}
              className="cursor-pointer tracking-tight"
            >
              Zrušit vyhledávání
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-1">
          {users.length === 0 ? (
            <div className="py-8 text-center">
              <Paragraph color="muted">
                {searchQuery
                  ? `Nebyli nalezeni žádní uživatelé pro "${searchQuery}"`
                  : "Žádní uživatelé"}
              </Paragraph>
            </div>
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                roles={roles}
                onRoleChange={handleRoleChange}
                onBanToggle={handleBanToggle}
                onQuotaChange={handleQuotaChange}
                onUpdateUserInfo={handleUpdateUserInfo}
              />
            ))
          )}
        </div>
      </section>

      <Modal isOpen={showSearchModal} onClose={closeSearchModal} size="md">
        <ModalHeader onClose={closeSearchModal}>Vyhledat uživatele</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="dashboard-users-search"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Vyhledávací dotaz
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  id="dashboard-users-search"
                  type="text"
                  placeholder="Hledat podle jména, příjmení nebo emailu..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="flex-1 bg-transparent text-sm tracking-tight text-zinc-200 placeholder:text-zinc-500 outline-none focus:ring-0"
                />
              </div>
              <Paragraph size="small" color="muted" className="mt-2">
                Vyhledávání probíhá podle jména, příjmení nebo emailu uživatele.
              </Paragraph>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={closeSearchModal}
            className="cursor-pointer tracking-tight"
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant="primary"
            onClick={handleSearch}
            className={`cursor-pointer tracking-tight ${loading ? "pointer-events-none opacity-50" : ""}`}
          >
            {loading ? "Vyhledávám..." : "Vyhledat"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
