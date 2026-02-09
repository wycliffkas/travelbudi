import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { Trip, TripDay } from "@/types";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { uploadImageAsync } from "@/services/firebase";
import { Plus, Trash2, MapPin, Calendar, Users } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function CreateTripScreen() {
  const insets = useSafeAreaInsets();
  const { addTrip, user } = useApp();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [spots, setSpots] = useState("");
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [ageRange, setAgeRange] = useState("");
  const [categories, setCategories] = useState("");
  const [whatsSpecial, setWhatsSpecial] = useState("");
  const [description, setDescription] = useState("");
  const [itinerary, setItinerary] = useState<TripDay[]>([
    { day: 1, title: "", location: "", description: "" }
  ]);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const addDay = useCallback(() => {
    setItinerary((prev) => [
      ...prev,
      { day: prev.length + 1, title: "", location: "", description: "" }
    ]);
  }, []);

  const removeDay = useCallback((index: number) => {
    setItinerary((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((d, i) => ({ ...d, day: i + 1 }));
    });
  }, []);

  const updateDay = useCallback(
    (index: number, field: keyof TripDay, value: string) => {
      setItinerary((prev) =>
        prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
      );
    },
    []
  );

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !destination.trim() || !location.trim()) {
      Alert.alert(
        "Missing Fields",
        "Please fill in the title, destination, and location."
      );
      return;
    }
    const spotsNum = parseInt(spots) || 6;

    // Upload image if provided
    let images: string[] = [];
    if (imageUri) {
      try {
        const uploadedUrl = await uploadImageAsync(imageUri);
        images = [uploadedUrl];
      } catch (error) {
        console.log("Image upload failed:", error);
        Alert.alert(
          "Image Upload Failed",
          "Could not upload image. Saving trip without image."
        );
      }
    }
    const durationDays = (() => {
      if (startDateObj && endDateObj) {
        const msPerDay = 24 * 60 * 60 * 1000;
        const diff = Math.round(
          (endDateObj.getTime() - startDateObj.getTime()) / msPerDay
        );
        return Math.max(1, diff + 1);
      }
      return 7;
    })();

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      title: title.trim(),
      destination: destination.trim(),
      location: location.trim(),
      images,
      startDate: startDate || "TBD",
      endDate: endDate || "TBD",
      duration: durationDays,
      stops: itinerary.length,
      ageRange: ageRange || "18-60 years",
      spotsTotal: spotsNum,
      spotsLeft: spotsNum,
      categories: categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      whatsSpecial: whatsSpecial || description,
      itinerary: itinerary.filter((d) => d.title.trim()),
      organizer: {
        id: user.id,
        name: user.name || "You",
        avatar:
          user.avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
        rating: user.stats.rating,
        tripsOrganized: user.stats.organized,
        verifications: user.verifications
      },
      isRecurring: false,
      recurringLabel: "",
      tripType: categories.split(",")[0]?.trim()?.toLowerCase() || "adventure",
      gender: "mixed"
    };

    addTrip(newTrip);
    Alert.alert("Trip Created!", "Your trip has been created successfully.");

    setTitle("");
    setDestination("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setSpots("");
    setAgeRange("");
    setCategories("");
    setWhatsSpecial("");
    setDescription("");
    setItinerary([{ day: 1, title: "", location: "", description: "" }]);
    setImageUri(null);
  }, [
    title,
    destination,
    location,
    startDate,
    endDate,
    startDateObj,
    endDateObj,
    spots,
    ageRange,
    categories,
    whatsSpecial,
    description,
    itinerary,
    user,
    addTrip,
    imageUri
  ]);

  const pickImage = async () => {
    console.log("Opening image picker");
    // Request permissions
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission denied",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });

    console.log("Image picker result:", result);
    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      console.log("Selected image URI:", uri);
      if (uri && uri.length > 0) {
        setImageUri(uri);
      } else {
        console.log("Image picker returned empty uri");
      }
    } else {
      console.log("User cancelled image picker");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Create Trip</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Trip Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bali Beach & Wellness"
              placeholderTextColor={Colors.textLight}
              value={title}
              onChangeText={setTitle}
              testID="trip-title-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Destination</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.inputIconText}
                placeholder="e.g., Bali"
                placeholderTextColor={Colors.textLight}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bali, Indonesia"
              placeholderTextColor={Colors.textLight}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Pressable
                onPress={() => setShowStartPicker(true)}
                style={{ flex: 1 }}>
                <Text style={styles.inputIconText}>
                  {startDate || "Mar 14, 2026"}
                </Text>
              </Pressable>
            </View>
            {showStartPicker && (
              <DateTimePicker
                value={startDateObj ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  setShowStartPicker(false);
                  if (selected) {
                    setStartDateObj(selected);
                    setStartDate(
                      selected.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    );
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>End Date</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Pressable
                onPress={() => setShowEndPicker(true)}
                style={{ flex: 1 }}>
                <Text style={styles.inputIconText}>
                  {endDate || "Mar 19, 2026"}
                </Text>
              </Pressable>
            </View>
            {showEndPicker && (
              <DateTimePicker
                value={endDateObj ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  setShowEndPicker(false);
                  if (selected) {
                    setEndDateObj(selected);
                    setEndDate(
                      selected.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    );
                  }
                }}
              />
            )}
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Total Spots</Text>
              <View style={styles.inputWithIcon}>
                <Users size={16} color={Colors.textSecondary} />
                <TextInput
                  style={styles.inputIconText}
                  placeholder="6"
                  placeholderTextColor={Colors.textLight}
                  value={spots}
                  onChangeText={setSpots}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age Range</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 25-40 years"
              placeholderTextColor={Colors.textLight}
              value={ageRange}
              onChangeText={setAgeRange}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Categories (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., beach, wellness, culture"
              placeholderTextColor={Colors.textLight}
              value={categories}
              onChangeText={setCategories}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your trip..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>What&apos;s Special</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What makes this trip unique"
            placeholderTextColor={Colors.textLight}
            value={whatsSpecial}
            onChangeText={setWhatsSpecial}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.inputLabel}>Trip Image</Text>
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>
            {imageUri ? "Change Image" : "Select Image"}
          </Text>
        </Pressable>
        {imageUri && imageUri.length > 0 && (
          <Image source={{ uri: imageUri }} style={styles.selectedImage} />
        )}

        <View style={styles.formSection}>
          <View style={styles.itineraryHeader}>
            <Text style={styles.sectionLabel}>Itinerary</Text>
            <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>
          </View>

          {itinerary.map((day, index) => (
            <View key={index} style={styles.dayForm}>
              <View style={styles.dayFormHeader}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                </View>
                {itinerary.length > 1 && (
                  <TouchableOpacity onPress={() => removeDay(index)}>
                    <Trash2 size={18} color={Colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Day title"
                placeholderTextColor={Colors.textLight}
                value={day.title}
                onChangeText={(v) => updateDay(index, "title", v)}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor={Colors.textLight}
                value={day.location}
                onChangeText={(v) => updateDay(index, "location", v)}
              />
              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                placeholder="Description"
                placeholderTextColor={Colors.textLight}
                value={day.description}
                onChangeText={(v) => updateDay(index, "description", v)}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          testID="create-trip-btn">
          <Text style={styles.createButtonText}>Create Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    gap: 20
  },
  formSection: {
    gap: 12
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text
  },
  inputGroup: {
    gap: 4
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8
  },
  inputIconText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12
  },
  textAreaSmall: {
    minHeight: 60,
    paddingTop: 12
  },
  itineraryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  addDayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight
  },
  addDayText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600" as const
  },
  dayForm: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  dayFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  dayBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  dayBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600" as const
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700" as const
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    alignItems: "center"
  },
  imagePickerText: {
    fontSize: 16,
    color: "#333"
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10
  }
});
