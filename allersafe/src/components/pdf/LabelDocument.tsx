import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { DishWithAllergens } from '@/types';
import { ALLERGEN_KEYS, allergenLabel } from '@/lib/allergens';
import type { AllergenKey } from '@/lib/allergens';

const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8, backgroundColor: '#fff' },
  label: {
    border: '1.5pt solid #15803d', borderRadius: 6, padding: 12, marginBottom: 12,
    maxWidth: 280,
  },
  productName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 6 },
  sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#374151', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  ingredientList: { fontSize: 7.5, color: '#374151', lineHeight: 1.5 },
  allergenHighlight: { fontFamily: 'Helvetica-Bold', textDecoration: 'underline', color: '#111827' },
  allergenBar: { marginTop: 8, paddingTop: 6, borderTop: '0.5pt solid #e5e7eb' },
  allergenChip: { fontSize: 6.5, color: '#15803d', fontFamily: 'Helvetica-Bold', marginRight: 4 },
  disclaimer: {
    marginTop: 8, paddingTop: 6, borderTop: '0.5pt solid #fca5a5',
    fontSize: 6, color: '#dc2626', lineHeight: 1.4,
  },
  natashasLaw: { fontSize: 6, color: '#6b7280', marginTop: 4, fontStyle: 'italic' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});

interface Props {
  dish: DishWithAllergens;
}

function buildIngredientText(dish: DishWithAllergens): Array<{ text: string; bold: boolean }> {
  const sorted = [...dish.ingredients].sort((a, b) => b.weight_grams - a.weight_grams);
  const parts: Array<{ text: string; bold: boolean }> = [];

  sorted.forEach((ing, idx) => {
    const isAllergen = ALLERGEN_KEYS.some(k => ing[k as keyof typeof ing]);
    const text = isAllergen ? ing.ingredient_name.toUpperCase() : ing.ingredient_name;
    const comma = idx < sorted.length - 1 ? ', ' : '.';
    parts.push({ text: text + comma, bold: isAllergen });
  });

  return parts;
}

export function PPDSLabelDocument({ dish }: Props) {
  const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const presentAllergens = ALLERGEN_KEYS.filter(k => dish.allergens[k as AllergenKey]);
  const ingredientParts = buildIngredientText(dish);

  return (
    <Document title={`PPDS Label — ${dish.name}`}>
      {/* 62mm × 100mm label — approximated in points */}
      <Page size={[176, 284]} style={styles.page}>
        <View style={styles.label}>
          <Text style={styles.productName}>{dish.name}</Text>

          {dish.description ? (
            <Text style={{ fontSize: 6.5, color: '#6b7280', marginBottom: 6 }}>{dish.description}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.row}>
            {ingredientParts.length === 0 ? (
              <Text style={styles.ingredientList}>No ingredients listed.</Text>
            ) : (
              ingredientParts.map((part, i) => (
                <Text key={i} style={[styles.ingredientList, part.bold ? styles.allergenHighlight : {}]}>
                  {part.text}
                </Text>
              ))
            )}
          </View>
          <Text style={styles.natashasLaw}>Allergens emphasised in BOLD CAPS</Text>

          {presentAllergens.length > 0 && (
            <View style={styles.allergenBar}>
              <Text style={styles.sectionTitle}>Contains:</Text>
              <View style={styles.row}>
                {presentAllergens.map(k => (
                  <Text key={k} style={styles.allergenChip}>{allergenLabel(k as AllergenKey)}</Text>
                ))}
              </View>
            </View>
          )}

          <View style={styles.disclaimer}>
            <Text>Always check with staff if you have an allergy. Produced in a kitchen where allergens are present. The food business remains responsible for accuracy.</Text>
          </View>

          <Text style={{ fontSize: 5, color: '#9ca3af', marginTop: 4 }}>Printed {now} | AllerSafe</Text>
        </View>
      </Page>

      {/* Also include an A4 sheet of 4 labels for easy printing */}
      <Page size="A4" style={{ ...styles.page, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Text style={{ width: '100%', fontSize: 9, color: '#374151', fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
          PPDS Label Sheet — {dish.name} — cut along borders
        </Text>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <View key={i} style={[styles.label, { width: 248, minHeight: 160 }]}>
            <Text style={styles.productName}>{dish.name}</Text>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.row}>
              {ingredientParts.length === 0 ? (
                <Text style={styles.ingredientList}>No ingredients listed.</Text>
              ) : (
                ingredientParts.map((part, j) => (
                  <Text key={j} style={[styles.ingredientList, part.bold ? styles.allergenHighlight : {}]}>
                    {part.text}
                  </Text>
                ))
              )}
            </View>
            {presentAllergens.length > 0 && (
              <View style={styles.allergenBar}>
                <Text style={styles.sectionTitle}>Contains:</Text>
                <View style={styles.row}>
                  {presentAllergens.map(k => (
                    <Text key={k} style={styles.allergenChip}>{allergenLabel(k as AllergenKey)}</Text>
                  ))}
                </View>
              </View>
            )}
            <Text style={{ fontSize: 5, color: '#9ca3af', marginTop: 4 }}>
              {now} | Printed by AllerSafe
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
