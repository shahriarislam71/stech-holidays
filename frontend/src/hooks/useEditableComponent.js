"use client";

import { useEffect, useState } from "react";

// Shared data/edit-mode logic for inline-editable ("CMS") sections.
// GET/PATCH `${apiUrl}/home/${name}/`. Edit mode is available whenever
// localStorage has an authToken (the same token useAuth stores on login),
// and writes are sent as `Authorization: Token <authToken>` to match the
// site's DRF TokenAuthentication.
export default function useEditableComponent(name, fallbackData) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = `${apiUrl}/home/${name}/`;

  const [data, setData] = useState(fallbackData);
  const [tempData, setTempData] = useState(fallbackData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("authToken"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Component data not found");
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setTempData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setData(fallbackData);
          setTempData(fallbackData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const startEdit = () => {
    if (!localStorage.getItem("authToken")) {
      alert("Admin access required. Please log in.");
      return;
    }
    setTempData(data);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setTempData(data);
    setEditMode(false);
  };

  const save = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Admin access required. Please log in.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify(tempData),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      const json = await res.json();
      setData(json);
      setTempData(json);
      setEditMode(false);
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file, category = name) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Admin access required. Please log in.");
      return null;
    }
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    try {
      const res = await fetch(`${apiUrl}/images/`, {
        method: "POST",
        headers: { Authorization: `Token ${authToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Image upload failed");
      const json = await res.json();
      return json.image;
    } catch (err) {
      alert("Image upload failed");
      return null;
    }
  };

  return {
    data,
    tempData,
    setTempData,
    isAdmin,
    editMode,
    startEdit,
    cancelEdit,
    save,
    saving,
    loading,
    uploadImage,
  };
}
