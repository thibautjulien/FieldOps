import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  apiGetInterventionById,
  apiGetInterventionPhotos,
  apiUpdateInterventionStatus,
  apiCloseIntervention,
  apiAddInterventionPhoto,
} from "../../../src/api/interventions";
import { API_BASE_URL } from "../../../src/api/client";
import { getMe } from "../../../src/services/AuthService";

function formatHour(dateStr) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatus(status = "") {
  return String(status).trim().toUpperCase();
}

function buildPhotoUrl(filePath = "") {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;

  const normalized = String(filePath).replace(/\\/g, "/");
  const uploadsIndex = normalized.indexOf("uploads/");
  const relativePath = uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized;

  return `${API_BASE_URL}/${relativePath.replace(/^\/+/, "")}`;
}

export default function InterventionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [error, setError] = useState("");
  const [intervention, setIntervention] = useState(null);
  const [photos, setPhotos] = useState({ avant: [], apres: [] });
  const [userRole, setUserRole] = useState("agent");

  const loadDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const [me, data, photosData] = await Promise.all([
        getMe(),
        apiGetInterventionById(id),
        apiGetInterventionPhotos(id),
      ]);

      if (me.success) {
        setUserRole((me.data?.role || "agent").toLowerCase());
      }

      setIntervention(data);
      setPhotos({
        avant: photosData?.avant || [],
        apres: photosData?.apres || photosData?.["après"] || [],
      });
    } catch (err) {
      setError(
        err?.response?.data?.error || "Impossible de charger le détail.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail]),
  );

  const currentStatus = normalizeStatus(intervention?.status);

  const hasAvant = (photos?.avant || []).length > 0;
  const hasApres = (photos?.apres || []).length > 0;

  const handleUpdate = async (type) => {
    if (!id || saving) return;

    try {
      setSaving(true);
      setError("");

      if (type === "EN_COURS") {
        await apiUpdateInterventionStatus(id, "EN_COURS");
      } else if (type === "TERMINE") {
        await apiUpdateInterventionStatus(id, "TERMINE");
      } else if (type === "CLOSE") {
        await apiCloseIntervention(id);
      }

      await loadDetail();
    } catch (err) {
      setError(
        err?.response?.data?.error || "Action impossible pour cet état.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTakePhoto = async (type) => {
    if (!id || photoSaving) return;

    try {
      setPhotoSaving(true);
      setError("");

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission refusée",
          "Autorise la caméra pour ajouter une photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      console.log(
        "[FieldOps] photo asset:",
        asset?.uri,
        asset?.mimeType,
        asset?.fileName,
      );

      await apiAddInterventionPhoto(id, {
        type,
        fileUri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      });

      await loadDetail();
    } catch (err) {
      console.error(
        "[FieldOps] add photo error:",
        err?.response?.status,
        err?.response?.data,
        err?.message,
      );
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Impossible d'ajouter la photo.",
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F4F7FA]">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View className="px-5 pt-3 pb-2">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text className="text-[#111827] font-semibold">← Retour</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Chargement...</Text>
        </View>
      ) : !intervention ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-slate-500">Intervention introuvable.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
          <View className="rounded-2xl bg-white p-5 border border-[#E2E8F0]">
            <Text className="text-xl font-bold text-[#111827]">
              {intervention.title}
            </Text>
            <Text className="text-slate-500 mt-1">
              {intervention.city_label || "Ville inconnue"}
            </Text>

            <View className="mt-4 gap-2">
              <Text className="text-slate-700">
                <Text className="font-semibold text-[#111827]">Heure :</Text>{" "}
                {intervention.scheduled_at
                  ? formatHour(intervention.scheduled_at)
                  : "-"}
              </Text>
              <Text className="text-slate-700">
                <Text className="font-semibold text-[#111827]">Statut :</Text>{" "}
                {normalizeStatus(intervention.status)}
              </Text>
              <Text className="text-slate-700">
                <Text className="font-semibold text-[#111827]">
                  Description :
                </Text>{" "}
                {intervention.description || "-"}
              </Text>
            </View>
          </View>

          {currentStatus === "EN_COURS" && (
            <View className="mt-4 rounded-2xl bg-white p-5 border border-[#E2E8F0]">
              <Text className="text-lg font-semibold text-[#111827] mb-3">
                Photos chantier
              </Text>

              <PhotoCard
                title="Photo AVANT"
                done={hasAvant}
                onPress={() => handleTakePhoto("AVANT")}
                disabled={photoSaving}
              />

              <PhotoCard
                title="Photo APRES"
                done={hasApres}
                onPress={() => handleTakePhoto("APRES")}
                disabled={photoSaving}
              />
            </View>
          )}

          {userRole === "admin" &&
            (currentStatus === "TERMINE" || currentStatus === "CLOS") && (
              <View className="mt-4 rounded-2xl bg-white p-5 border border-[#E2E8F0]">
                <Text className="text-lg font-semibold text-[#111827] mb-3">
                  Photos intervention
                </Text>

                <Text className="text-sm font-semibold text-slate-700 mb-2">
                  AVANT
                </Text>
                {photos.avant.length === 0 ? (
                  <Text className="text-slate-500 mb-3">
                    Aucune photo AVANT
                  </Text>
                ) : (
                  photos.avant.map((p) => (
                    <Image
                      key={`avant-${p.id}`}
                      source={{ uri: buildPhotoUrl(p.file_path) }}
                      style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 12,
                        marginBottom: 8,
                      }}
                      resizeMode="cover"
                    />
                  ))
                )}

                <Text className="text-sm font-semibold text-slate-700 mt-2 mb-2">
                  APRES
                </Text>
                {photos.apres.length === 0 ? (
                  <Text className="text-slate-500">Aucune photo APRES</Text>
                ) : (
                  photos.apres.map((p) => (
                    <Image
                      key={`apres-${p.id}`}
                      source={{ uri: buildPhotoUrl(p.file_path) }}
                      style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 12,
                        marginBottom: 8,
                      }}
                      resizeMode="cover"
                    />
                  ))
                )}
              </View>
            )}

          <View className="mt-4 rounded-2xl bg-white p-5 border border-[#E2E8F0]">
            <Text className="text-lg font-semibold text-[#111827] mb-3">
              Actions
            </Text>

            <View className="gap-2">
              {currentStatus === "PLANIFIE" && (
                <ActionBtn
                  label="Prendre en charge"
                  onPress={() => handleUpdate("EN_COURS")}
                  disabled={saving}
                />
              )}

              {currentStatus === "EN_COURS" && (
                <ActionBtn
                  label="Marquer terminée"
                  onPress={() => handleUpdate("TERMINE")}
                  disabled={saving}
                />
              )}

              {currentStatus === "TERMINE" && (
                <ActionBtn
                  label="Clôturer"
                  onPress={() => handleUpdate("CLOSE")}
                  disabled={saving}
                />
              )}

              {currentStatus === "CLOS" && (
                <Text className="text-slate-500">
                  Intervention déjà clôturée.
                </Text>
              )}
            </View>

            {!!error && <Text className="text-red-600 mt-3">{error}</Text>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ActionBtn({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className={`rounded-xl px-4 py-3 ${disabled ? "bg-slate-300" : "bg-[#1F2937]"}`}
    >
      <Text className="text-white font-semibold text-center">{label}</Text>
    </TouchableOpacity>
  );
}

function PhotoCard({ title, done, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className="mb-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4"
    >
      <Text className="text-[#111827] font-semibold">{title}</Text>
      <Text className="text-xs text-slate-500 mt-1">
        {done ? "Photo ajoutée" : "Appuie pour ouvrir la caméra"}
      </Text>
    </TouchableOpacity>
  );
}
