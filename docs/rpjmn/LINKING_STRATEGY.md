# RPJMN 2025-2029 Linking & Enhancement Strategy

## Enhancement Plan

### Phase 1: Text Cleanup & Formatting
- Remove excessive spaces (PDF artifacts)
- Fix ligatures (ﬁ → fi, ﬂ → fl)
- Normalize line breaks
- Clean up table formatting
- Ensure consistent heading structure

### Phase 2: YAML Frontmatter Structure

```yaml
---
title: "Document Title"
chapter: "BAB X"
priority: "PN X" (if applicable)
region: "Wilayah Name" (if applicable)
tags:
  - concept-tag-1
  - concept-tag-2
  - sector-tag
categories:
  - main-category
  - sub-category
related_priorities:
  - PN X
  - PN Y
related_regions:
  - Region Name
key_concepts:
  - Concept 1
  - Concept 2
cross_references:
  - "[[Other Document]]"
status: "validated"
date: "2025-10-29"
---
```

### Phase 3: Taxonomy Structure

**Primary Categories:**
1. **Prioritas Nasional** (PN1-PN8)
2. **Pembangunan Wilayah** (7 regions)
3. **Sektor Ekonomi** (primary, secondary, tertiary)
4. **Tema Strategis** (cross-cutting themes)

**Tag Hierarchy:**

**Tier 1 - Priority Tags:**
- `pn1-ideologi-demokrasi`
- `pn2-kemandirian-bangsa`
- `pn3-infrastruktur-ekonomi`
- `pn4-sdm-teknologi`
- `pn5-hilirisasi-industri`
- `pn6-pembangunan-desa`
- `pn7-reformasi-institusi`
- `pn8-lingkungan-budaya`

**Tier 2 - Thematic Tags:**
- `swasembada-pangan`
- `swasembada-energi`
- `swasembada-air`
- `ekonomi-digital`
- `ekonomi-hijau`
- `ekonomi-biru`
- `ekonomi-syariah`
- `hilirisasi`
- `transformasi-digital`
- `transisi-energi`
- `pembangunan-berkelanjutan`

**Tier 3 - Sector Tags:**
- `pertanian`
- `perikanan`
- `energi`
- `industri`
- `pariwisata`
- `pendidikan`
- `kesehatan`
- `infrastruktur`
- `teknologi`
- `lingkungan`

**Tier 4 - Geographic Tags:**
- `wilayah-sumatera`
- `wilayah-jawa`
- `wilayah-bali-nusa-tenggara`
- `wilayah-kalimantan`
- `wilayah-sulawesi`
- `wilayah-maluku`
- `wilayah-papua`

**Tier 5 - Commodity Tags:**
- `nikel`
- `kelapa-sawit`
- `rumput-laut`
- `garam`
- `tembaga`
- `bauksit`
- `timah`

**Tier 6 - Concept Tags:**
- `sdm`
- `infrastruktur`
- `teknologi-inovasi`
- `data-governance`
- `kemiskinan`
- `kesenjangan`
- `kemandirian`

### Phase 4: Hub Pages to Create

1. **00_INDEX.md** - Master navigation hub
2. **Swasembada_Hub.md** - Links all self-sufficiency content (pangan, energi, air)
3. **Hilirisasi_Hub.md** - Links all downstream processing content
4. **SDM_Hub.md** - Links all human development content
5. **Infrastruktur_Hub.md** - Links all infrastructure content
6. **Lingkungan_Hub.md** - Links all environment content
7. **Pembangunan_Desa_Hub.md** - Links all village development content
8. **Reformasi_Hub.md** - Links all institutional reform content
9. **Wilayah_Hub.md** - Links all regional development content
10. **Konsep_Kunci.md** - Glossary of key Indonesian government terms

### Phase 5: Cross-Reference Patterns

**Pattern 1: Concept References**
When text mentions a key concept, add wikilink:
- "swasembada pangan" → `[[Swasembada_Hub#Pangan|swasembada pangan]]`
- "hilirisasi nikel" → `[[Hilirisasi_Hub#Nikel|hilirisasi nikel]]`
- "pembangunan SDM" → `[[SDM_Hub|pembangunan SDM]]`

**Pattern 2: Priority Cross-References**
When a priority references another:
- In PN2 mentioning PN5: `[[III_Prioritas_5_Melanjutkan_Hilirisasi_dan_Mengembangkan|Prioritas Nasional 5: Hilirisasi]]`

**Pattern 3: Regional Cross-References**
When priority mentions region:
- "Lumbung Pangan Kalimantan" → `[[IV_Wilayah_5_Kalimantan#Lumbung-Pangan|Lumbung Pangan Kalimantan]]`

**Pattern 4: BAB Cross-References**
When chapter references another:
- BAB III referencing BAB II framework → `[[II_Kebijakan_Pembangunan#Kerangka-Pikir|kerangka kebijakan]]`

### Phase 6: Navigation Elements

**Top of each file (after frontmatter):**
```markdown
> **Navigation:** [[00_INDEX|🏠 Index]] | [[README|📖 About]] | [[VALIDATION_REPORT|✅ Quality Report]]
>
> **You are here:** [Chapter/Section Name]
>
> **Related:** [[Related_File_1]] | [[Related_File_2]] | [[Hub_Page]]

---
```

**Bottom of each file:**
```markdown
---

## Related Content

### In This Series
- Previous: [[Previous_Chapter]]
- Next: [[Next_Chapter]]

### Related Topics
- [[Concept_Hub_1]]
- [[Concept_Hub_2]]
- [[Related_Priority]]

### By Region
- [[Regional_Implementation]]

---

**Tags:** #tag1 #tag2 #tag3

**Last Updated:** 2025-10-29
```

### Phase 7: Specific Linking Priorities

**High-Priority Concepts (link every mention):**
1. Swasembada (pangan, energi, air)
2. Hilirisasi
3. SDM
4. Infrastruktur
5. Teknologi/Inovasi
6. Lingkungan
7. Data governance
8. Each of the 8 regional names
9. Pancasila/Demokrasi
10. Pembangunan berkelanjutan

**Medium-Priority Concepts (link first 2-3 mentions per file):**
- Specific commodities (nikel, kelapa sawit, etc.)
- Sector terms (pertanian, industri, pariwisata)
- Economic concepts (ekonomi digital, ekonomi hijau)
- Development zones (KEK, KIT, KSPP)

**Low-Priority (link once per section):**
- Common development terms
- General infrastructure terms
- Generic policy terminology

### Phase 8: Format Cleanup Patterns

**Pattern 1: Multiple Spaces**
```regex
Find: \s{2,}
Replace: (single space)
```

**Pattern 2: Ligatures**
```regex
Find: ﬁ
Replace: fi

Find: ﬂ
Replace: fl
```

**Pattern 3: Broken Lines (cautious - context-dependent)**
Only join lines that are clearly mid-sentence breaks.

**Pattern 4: Table Formatting**
Ensure tables use proper markdown:
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

### Phase 9: Aesthetic Improvements

1. **Heading Hierarchy:**
   - Ensure # is document title
   - ## for major sections
   - ### for subsections
   - #### for detailed points

2. **List Formatting:**
   - Consistent bullet style
   - Proper indentation
   - Space after bullet

3. **Paragraph Spacing:**
   - Blank line between paragraphs
   - No excessive blank lines (max 2)

4. **Emphasis:**
   - **Bold** for key concepts first mention
   - *Italic* for emphasis
   - `code` for technical terms/indices

### Phase 10: Quality Checks

**For Each File:**
- [ ] YAML frontmatter complete and accurate
- [ ] All high-priority concepts linked
- [ ] Navigation elements present
- [ ] Format cleaned (spaces, ligatures)
- [ ] Headings properly hierarchical
- [ ] Tables properly formatted
- [ ] Links all valid (no broken links)
- [ ] Tags accurate and complete
- [ ] Aesthetic: clean, professional appearance
- [ ] Cross-references bidirectional where appropriate

### Implementation Order

1. **First:** Create hub pages and index
2. **Second:** Add YAML frontmatter to all existing files
3. **Third:** Clean up text formatting
4. **Fourth:** Add internal links systematically (priority-by-priority)
5. **Fifth:** Add navigation elements
6. **Sixth:** Validate all links and formatting
7. **Seventh:** Final aesthetic review
8. **Eighth:** Deploy to GitHub Pages

---

**Status:** Strategy document - implementation pending
**Created:** 2025-10-29
