import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { db, storage, STORAGE_BUCKET } from "@/config/firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { User, Trip, Match, Conversation } from "@/types";
import { mockTrips } from "@/mocks/trips";
import { mockMatches } from "@/mocks/matches";
import { mockConversations } from "@/mocks/conversations";

const COLLECTIONS = {
  USERS: "users",
  TRIPS: "trips",
  MATCHES: "matches",
  CONVERSATIONS: "conversations",
  BOOKMARKS: "bookmarks"
} as const;

const USER_ID = "me";

export async function uploadImageAsync(
  uri: string,
  path?: string
): Promise<string> {
  try {
    console.log("[Firebase] Uploading image...", uri);
    if (!uri) throw new Error("No uri provided");
    if (uri.startsWith("http")) {
      // Already a remote URL
      return uri;
    }
    // Try reading file as base64 via Expo FileSystem and upload with uploadString
    // This avoids creating blobs/ArrayBuffers that Firebase web SDK can't handle in RN
    const extMatch = uri.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    const filename =
      path ??
      `images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const sRef = storageRef(storage, filename);

    try {
      // Read local file as base64 (works for file:// URIs in Expo)

      const FileSystem = require("expo-file-system");
      console.log("[Firebase] Reading file as base64 via FileSystem:", uri);
      // Some Expo versions may not expose EncodingType; use literal 'base64' to be safe
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64"
      });
      console.log("[Firebase] Read base64 length:", base64.length);
      // upload as base64 string
      // use uploadString to avoid Blob issues

      const { uploadString } = require("firebase/storage");
      await uploadString(sRef, base64, "base64", { contentType: mime });
      const url = await getDownloadURL(sRef);
      console.log("[Firebase] Image uploaded via base64:", url);
      return url;
    } catch (fsErr) {
      console.log(
        "[Firebase] FileSystem base64 read failed, falling back to fetch:",
        fsErr
      );
      // Fallback: fetch and convert to base64
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      // Try direct REST upload to Firebase Storage (works when SDK blob support is missing)
      try {
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(
          filename
        )}`;
        console.log(
          "[Firebase] Uploading via REST to",
          uploadUrl,
          "mime:",
          mime,
          "size:",
          arrayBuffer.byteLength
        );
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": mime
          },
          body: arrayBuffer as any
        });
        if (!uploadRes.ok) {
          const text = await uploadRes.text();
          throw new Error(`REST upload failed: ${uploadRes.status} ${text}`);
        }
        const json = await uploadRes.json();
        const token = json.downloadTokens || json.downloadToken || null;
        const url = token
          ? `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`
          : `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(filename)}?alt=media`;
        console.log("[Firebase] Image uploaded via REST:", url, json);
        return url;
      } catch (restErr) {
        console.log(
          "[Firebase] REST upload failed, cannot upload image:",
          restErr
        );
        throw restErr;
      }
    }
  } catch (error) {
    console.log("[Firebase] Error uploading image:", error);
    throw error;
  }
}

export async function getUser(): Promise<User | null> {
  try {
    console.log("[Firebase] Fetching user...");
    const docRef = doc(db, COLLECTIONS.USERS, USER_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("[Firebase] User found");
      return docSnap.data() as User;
    }
    console.log("[Firebase] No user found");
    return null;
  } catch (error) {
    console.log("[Firebase] Error fetching user:", error);
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    console.log("[Firebase] Saving user...");
    const docRef = doc(db, COLLECTIONS.USERS, USER_ID);
    await setDoc(docRef, user);
    console.log("[Firebase] User saved successfully");
  } catch (error) {
    console.log("[Firebase] Error saving user:", error);
    throw error;
  }
}

export async function getTrips(): Promise<Trip[]> {
  try {
    console.log("[Firebase] Fetching trips...");
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TRIPS));
    if (querySnapshot.empty) {
      console.log("[Firebase] No trips found, seeding mock data...");
      await seedTrips();
      return mockTrips;
    }
    const trips = querySnapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        images: data.images ?? [],
        categories: data.categories ?? [],
        itinerary: data.itinerary ?? [],
        spotsLeft: data.spotsLeft ?? 0,
        spotsTotal: data.spotsTotal ?? 0,
        duration: data.duration ?? 0,
        isRecurring: data.isRecurring ?? false,
        recurringLabel: data.recurringLabel ?? "",
        organizer: data.organizer ?? {
          id: "",
          name: "Unknown",
          avatar: "",
          rating: 0,
          tripsOrganized: 0,
          verifications: { email: false, phone: false, identity: "none" }
        }
      } as Trip;
    });
    console.log(`[Firebase] Fetched ${trips.length} trips`);
    return trips;
  } catch (error) {
    console.log("[Firebase] Error fetching trips:", error);
    return mockTrips;
  }
}

export async function saveTrip(trip: Trip): Promise<void> {
  try {
    console.log("[Firebase] Saving trip:", trip.id);
    const docRef = doc(db, COLLECTIONS.TRIPS, trip.id);
    await setDoc(docRef, trip);
    console.log("[Firebase] Trip saved successfully");
  } catch (error) {
    console.log("[Firebase] Error saving trip:", error);
    throw error;
  }
}

export async function getMatches(): Promise<Match[]> {
  try {
    console.log("[Firebase] Fetching matches...");
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.MATCHES));
    if (querySnapshot.empty) {
      console.log("[Firebase] No matches found, seeding mock data...");
      await seedMatches();
      return mockMatches;
    }
    const matches = querySnapshot.docs.map((d) => d.data() as Match);
    console.log(`[Firebase] Fetched ${matches.length} matches`);
    return matches;
  } catch (error) {
    console.log("[Firebase] Error fetching matches:", error);
    return mockMatches;
  }
}

export async function updateMatch(
  matchId: string,
  status: "accepted" | "declined"
): Promise<void> {
  try {
    console.log("[Firebase] Updating match:", matchId, status);
    const docRef = doc(db, COLLECTIONS.MATCHES, matchId);
    await updateDoc(docRef, { status });
    console.log("[Firebase] Match updated successfully");
  } catch (error) {
    console.log("[Firebase] Error updating match:", error);
    throw error;
  }
}

export async function getConversations(): Promise<Conversation[]> {
  try {
    console.log("[Firebase] Fetching conversations...");
    const querySnapshot = await getDocs(
      collection(db, COLLECTIONS.CONVERSATIONS)
    );
    if (querySnapshot.empty) {
      console.log("[Firebase] No conversations found, seeding mock data...");
      await seedConversations();
      return mockConversations;
    }
    const conversations = querySnapshot.docs.map(
      (d) => d.data() as Conversation
    );
    console.log(`[Firebase] Fetched ${conversations.length} conversations`);
    return conversations;
  } catch (error) {
    console.log("[Firebase] Error fetching conversations:", error);
    return mockConversations;
  }
}

export async function saveConversation(
  conversation: Conversation
): Promise<void> {
  try {
    console.log("[Firebase] Saving conversation:", conversation.id);
    const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conversation.id);
    await setDoc(docRef, conversation);
    console.log("[Firebase] Conversation saved successfully");
  } catch (error) {
    console.log("[Firebase] Error saving conversation:", error);
    throw error;
  }
}

export async function getBookmarks(): Promise<string[]> {
  try {
    console.log("[Firebase] Fetching bookmarks...");
    const docRef = doc(db, COLLECTIONS.BOOKMARKS, USER_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[Firebase] Bookmarks found");
      return (data.tripIds as string[]) || [];
    }
    console.log("[Firebase] No bookmarks found");
    return [];
  } catch (error) {
    console.log("[Firebase] Error fetching bookmarks:", error);
    return [];
  }
}

export async function saveBookmarks(tripIds: string[]): Promise<void> {
  try {
    console.log("[Firebase] Saving bookmarks...");
    const docRef = doc(db, COLLECTIONS.BOOKMARKS, USER_ID);
    await setDoc(docRef, { tripIds });
    console.log("[Firebase] Bookmarks saved successfully");
  } catch (error) {
    console.log("[Firebase] Error saving bookmarks:", error);
    throw error;
  }
}

async function seedTrips(): Promise<void> {
  try {
    console.log("[Firebase] Seeding trips...");
    const batch = writeBatch(db);
    mockTrips.forEach((trip) => {
      const docRef = doc(db, COLLECTIONS.TRIPS, trip.id);
      batch.set(docRef, trip);
    });
    await batch.commit();
    console.log("[Firebase] Trips seeded successfully");
  } catch (error) {
    console.log("[Firebase] Error seeding trips:", error);
  }
}

async function seedMatches(): Promise<void> {
  try {
    console.log("[Firebase] Seeding matches...");
    const batch = writeBatch(db);
    mockMatches.forEach((match) => {
      const docRef = doc(db, COLLECTIONS.MATCHES, match.id);
      batch.set(docRef, match);
    });
    await batch.commit();
    console.log("[Firebase] Matches seeded successfully");
  } catch (error) {
    console.log("[Firebase] Error seeding matches:", error);
  }
}

async function seedConversations(): Promise<void> {
  try {
    console.log("[Firebase] Seeding conversations...");
    const batch = writeBatch(db);
    mockConversations.forEach((conv) => {
      const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conv.id);
      batch.set(docRef, conv);
    });
    await batch.commit();
    console.log("[Firebase] Conversations seeded successfully");
  } catch (error) {
    console.log("[Firebase] Error seeding conversations:", error);
  }
}

export async function deleteUserData(): Promise<void> {
  try {
    console.log("[Firebase] Deleting user data...");
    const userRef = doc(db, COLLECTIONS.USERS, USER_ID);
    const bookmarksRef = doc(db, COLLECTIONS.BOOKMARKS, USER_ID);
    await deleteDoc(userRef);
    await deleteDoc(bookmarksRef);
    console.log("[Firebase] User data deleted successfully");
  } catch (error) {
    console.log("[Firebase] Error deleting user data:", error);
    throw error;
  }
}
