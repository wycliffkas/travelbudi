import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  Pressable
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Users,
  Star,
  Bookmark,
  X
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useApp } from "@/providers/AppProvider";
import { Trip } from "@/types";

const FILTER_TYPES = ["All", "Cultural", "Wellness", "Adventure", "Beach"];
const FILTER_GENDERS = ["All", "Mixed", "Women Only", "Men Only"];

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

function TripCard({
  trip,
  isBookmarked,
  onToggleBookmark,
  onPress
}: {
  trip: Trip;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onPress: () => void;
}) {
  const spotsWarning = (trip.spotsLeft ?? 0) <= 2;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const imageUri =
    trip.images && trip.images.length > 0 ? trip.images[0] : PLACEHOLDER_IMAGE;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[styles.tripCard, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.tripImage} />
          <View style={styles.imageOverlay} />
          {trip.isRecurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringText}>{trip.recurringLabel}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            testID={`bookmark-${trip.id}`}>
            <Bookmark
              size={18}
              color={isBookmarked ? Colors.primary : Colors.white}
              fill={isBookmarked ? Colors.primary : "transparent"}
            />
          </TouchableOpacity>
          <View style={styles.imageTextOverlay}>
            <Text style={styles.tripTitleOverlay}>{trip.title}</Text>
          </View>
        </View>
        <View style={styles.tripContent}>
          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoItem}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.tripInfoText}>{trip.location}</Text>
            </View>
            <View style={styles.tripInfoItem}>
              <Calendar size={14} color={Colors.textSecondary} />
              <Text style={styles.tripInfoText}>
                {trip.startDate} -{" "}
                {trip.endDate.split(", ")[0].split(" ").slice(0, 2).join(" ")}
              </Text>
            </View>
          </View>
          <View style={styles.tripMetaRow}>
            <Text style={styles.durationText}>{trip.duration} days</Text>
            <View style={styles.spotsContainer}>
              <Users
                size={14}
                color={spotsWarning ? Colors.danger : Colors.primary}
              />
              <Text
                style={[styles.spotsText, spotsWarning && styles.spotsWarning]}>
                {trip.spotsLeft} of {trip.spotsTotal} spots left
              </Text>
            </View>
          </View>
          <View style={styles.categoriesRow}>
            {(trip.categories ?? []).map((cat) => (
              <View key={cat} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
            ))}
          </View>
          <View style={styles.organizerRow}>
            <Image
              source={{ uri: trip.organizer.avatar }}
              style={styles.organizerAvatar}
            />
            <Text style={styles.organizerName}>{trip.organizer.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color={Colors.star} fill={Colors.star} />
              <Text style={styles.ratingText}>{trip.organizer.rating}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { trips, bookmarks, toggleBookmark, user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        !searchQuery ||
        (trip.destination || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (trip.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trip.location || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === "All" ||
        (trip.tripType || "").toLowerCase() === selectedType.toLowerCase();
      const matchesGender =
        selectedGender === "All" ||
        (trip.gender || "").toLowerCase() ===
          selectedGender.toLowerCase().replace(" only", "");
      return matchesSearch && matchesType && matchesGender;
    });
  }, [trips, searchQuery, selectedType, selectedGender]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Trips</Text>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          testID="filter-button">
          <SlidersHorizontal size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.tripsList}
        contentContainerStyle={styles.tripsContent}
        showsVerticalScrollIndicator={false}>
        {filteredTrips.map((trip, index) => (
          <TripCard
            key={trip.id ?? `trip-${index}`}
            trip={trip}
            isBookmarked={bookmarks.includes(trip.id)}
            onToggleBookmark={() => toggleBookmark(trip.id)}
            onPress={() => router.push(`/trip-details?id=${trip.id}`)}
          />
        ))}
        {filteredTrips.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No trips found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowFilters(false)}
          />
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + 20 }
            ]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.filterLabel}>Trip Type</Text>
            <View style={styles.filterChips}>
              {FILTER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedType === type && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedType(type)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedType === type && styles.filterChipTextActive
                    ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterLabel}>Gender</Text>
            <View style={styles.filterChips}>
              {FILTER_GENDERS.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.filterChip,
                    selectedGender === gender && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedGender(gender)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedGender === gender && styles.filterChipTextActive
                    ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedType("All");
                setSelectedGender("All");
              }}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    alignItems: "center"
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border
  },
  tripsList: {
    flex: 1
  },
  tripsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16
  },
  tripCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },
  imageContainer: {
    height: 200,
    position: "relative"
  },
  tripImage: {
    width: "100%",
    height: "100%"
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)"
  },
  recurringBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  recurringText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600" as const
  },
  bookmarkButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center"
  },
  imageTextOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12
  },
  tripTitleOverlay: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  tripContent: {
    padding: 14,
    gap: 10
  },
  tripInfoRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap"
  },
  tripInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  tripInfoText: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  tripMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  durationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const
  },
  spotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  spotsText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600" as const
  },
  spotsWarning: {
    color: Colors.danger
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap"
  },
  categoryChip: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  categoryText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500" as const
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight
  },
  organizerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  organizerName: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500" as const
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  ratingText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "600" as const
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end"
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
    marginTop: 8
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500" as const
  },
  filterChipTextActive: {
    color: Colors.white
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600" as const
  },
  clearButton: {
    alignItems: "center",
    paddingVertical: 12
  },
  clearButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500" as const
  }
});
