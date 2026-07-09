import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIMARY = '#7b1fa2';

// Mapea el valor estable de etapa a su etiqueta visible (spec 006-order-tracking).
export const STAGE_LABELS = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_REVISION: 'EnRevisión',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

// Color semántico por etapa (usado en badges y en la línea de tiempo).
export const STAGE_COLORS = {
  PENDIENTE: '#f59e0b',   // ámbar — a la espera
  CONFIRMADO: '#2563eb',  // azul — en progreso
  EN_REVISION: '#8b5cf6', // violeta — en revisión
  ENTREGADO: '#16a34a',   // verde — completado
  CANCELADO: '#6b7280',   // gris — cancelado
};

export function stageColor(stage) {
  return STAGE_COLORS[stage] || '#6b7280';
}

const ACTION_LABELS = {
  create: 'Pedido creado',
  accept: 'Aceptado por el freelancer',
  reject: 'Rechazado por el freelancer',
  deliver: 'Trabajo entregado',
  accept_delivery: 'Entrega aceptada',
  request_changes: 'Cambios solicitados',
  cancel: 'Pedido cancelado',
};

export function stageLabel(stage) {
  return STAGE_LABELS[stage] || stage;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

// Componente presentacional: recibe `history` (array de transiciones) y `stage` actual.
// No contiene lógica de negocio ni de rol.
export default function OrderTimeline({ history = [], stage }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Historial</Text>
      {history.map((h, i) => {
        const isLast = i === history.length - 1;
        return (
          <View key={i} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={[styles.dot, isLast && { backgroundColor: stageColor(stage) }]} />
              {!isLast && <View style={styles.line} />}
            </View>
            <View style={styles.content}>
              <Text style={styles.stageText}>
                {ACTION_LABELS[h.action] || h.action} → {stageLabel(h.to)}
              </Text>
              <Text style={styles.dateText}>{formatDate(h.at)}</Text>
            </View>
          </View>
        );
      })}
      <Text style={[styles.currentText, { color: stageColor(stage) }]}>Etapa actual: {stageLabel(stage)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  row: { flexDirection: 'row' },
  markerColumn: { width: 24, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ccc', marginTop: 3 },
  dotActive: { backgroundColor: PRIMARY },
  line: { width: 2, flex: 1, backgroundColor: '#e0e0e0', marginVertical: 2 },
  content: { flex: 1, paddingBottom: 16, paddingLeft: 8 },
  stageText: { fontSize: 14, color: '#1a1a2e', fontWeight: '600' },
  dateText: { fontSize: 12, color: '#888', marginTop: 2 },
  currentText: { fontSize: 14, fontWeight: '700', color: PRIMARY, marginTop: 4 },
});
