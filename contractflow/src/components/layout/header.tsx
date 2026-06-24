"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Contract signed",
    body: "Acme Corp has signed the Q1 Service Agreement.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    title: "Invoice overdue",
    body: "Invoice #INV-202406-021 is 3 days overdue.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: "3",
    title: "New client added",
    body: "Horizon Labs was added to your client list.",
    time: "Yesterday",
    unread: true,
  },
];

type ThemeOption = "light" | "dark" | "system";

const themeOptions: { value: ThemeOption; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  const currentThemeIcon = themeOptions.find((t) => t.value === theme) ?? themeOptions[2];
  const ThemeIcon = currentThemeIcon.icon;

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 gap-3">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className={cn(
          "relative flex items-center flex-1 max-w-md transition-all",
          searchFocused ? "max-w-lg" : ""
        )}
      >
        <Search className="absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search contracts, clients, invoices…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={cn(
            "w-full h-9 pl-9 pr-9 text-sm bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100",
            searchFocused
              ? "border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 bg-white dark:bg-gray-800"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          )}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      <div className="ml-auto flex items-center gap-1">
        {/* Theme toggle */}
        <div ref={themeMenuRef} className="relative">
          <button
            onClick={() => setThemeMenuOpen((o) => !o)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            <ThemeIcon className="w-4.5 h-4.5" />
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    setThemeMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    theme === value
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {theme === value && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none ring-2 ring-white dark:ring-gray-900">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-1 w-80 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No notifications
                  </li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n.id}
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                        n.unread && "bg-indigo-50/50 dark:bg-indigo-950/30"
                      )}
                    >
                      {n.unread && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                      {!n.unread && <span className="mt-1.5 w-2 h-2 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {n.body}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {n.time}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="User menu"
          >
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "User"}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-24 truncate">
              {user?.firstName ?? user?.username ?? "Account"}
            </span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform",
                userMenuOpen && "rotate-180"
              )}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50 py-1 overflow-hidden">
              {/* Account info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.fullName ?? user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              <Link
                href="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                Your Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                Settings
              </Link>

              <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                <button
                  onClick={() => signOut({ redirectUrl: "/sign-in" })}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
