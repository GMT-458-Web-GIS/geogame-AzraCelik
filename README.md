# Ne Kadar Galatasaray Fanısın (GeoGame)

## 🎮 Oyun Açıklaması

"Ne kadar Galatasary Fanısın", Galatasaray futbol takımının oyuncularının ülkelerini harita üzerinde tahmin etmeye dayalı interaktif bir coğrafya oyunudur. Oyun, Leaflet.js harita kütüphanesi kullanılarak geliştirilmiş olup, tamamen tarayıcı tabanlı çalışmaktadır.

## 📋 Oyun Kuralları

### Genel Kurallar
- Oyun 3 zorluk seviyesinden oluşur: **KOLAY**, **ORTA**, **ZOR**
- Her zorluk seviyesinde 10 oyuncu sorusu ve 2 trivia sorusu bulunur
- Toplam 30 oyuncu sorusu ve 6 trivia sorusu ile oyun tamamlanır
- Oyuncular 75 kişilik havuzdan rastgele seçilir
- Her oyun farklıdır (rastgele seçim mekanizması)

### Zorluk Seviyeleri

| Seviye | Süre | Harita Yakınlaştırma | Skor Çarpanı |
|--------|------|---------------------|--------------|
| **KOLAY** | 45 saniye | Aktif | ×1 |
| **ORTA** | 30 saniye | Aktif | ×1.5 |
| **ZOR** | 15 saniye | Pasif | ×2 |

### Oyun Akışı

1. **KOLAY Seviyesi** (10 oyuncu + 2 trivia)
   - 5. raunddan sonra ilk trivia sorusu
   - 10. raunddan sonra ikinci trivia sorusu
   
2. **ORTA Seviyesi** (10 oyuncu + 2 trivia)
   - 5. raunddan sonra ilk trivia sorusu
   - 10. raunddan sonra ikinci trivia sorusu
   
3. **ZOR Seviyesi** (10 oyuncu + 2 trivia)
   - 5. raunddan sonra ilk trivia sorusu
   - 10. raunddan sonra ikinci trivia sorusu
   - Oyun sonu

## 🎯 Skorlama Sistemi

### Puan Hesaplama

- **Doğru Ülke Tahmini**: 10 puan × zorluk çarpanı
- **Hızlı Cevap Bonusu**: +2 puan (süre bitmeden cevap verilirse)
- **Trivia Doğru Cevap**: +5 puan

### Skor Normalizasyonu

Oyun sonunda skor 0-100 arasına normalize edilir:
- Maksimum olası skor hesaplanır
- Final skor = (Toplam Skor / Maksimum Skor) × 100

### Fan Seviyeleri

| Skor Aralığı | Fan Seviyesi |
|--------------|--------------|
| 0-30 | Yeni Tanışıyor |
| 31-60 | Sempatik Taraftar |
| 61-80 | Çılgın Galatasaraylı |
| 81-100 | Ultraslan Efsanesi |

## 🔄 Rastgele Seçim Mekanizması

- **Oyuncu Seçimi**: 75 oyuncudan her oyun için 30 oyuncu rastgele seçilir
- **Trivia Seçimi**: Trivia havuzundan her oyun için 6 soru rastgele seçilir
- **Karıştırma**: Fisher-Yates shuffle algoritması benzeri bir yöntem kullanılır
- **Tekrar**: Her oyun farklı bir kombinasyon sunar

## 🛠️ Teknoloji Yığını

### Frontend
- **HTML5**: Yapısal iskelet
- **CSS3**: Modern ve responsive tasarım
- **JavaScript (ES6+)**: Oyun mantığı ve etkileşim

### Harita Kütüphanesi
- **Leaflet.js v1.9.4**: İnteraktif harita görselleştirme
- **OpenStreetMap**: Harita tile'ları
- **Nominatim API**: Reverse geocoding (koordinat → ülke)

### Veri Yönetimi
- **JSON**: Oyuncu ve trivia verileri
  - `players.json`: 75 Galatasaray oyuncusu
  - `trivia.json`: Galatasaray ile ilgili trivia soruları

## 🎨 Tasarım Raporu

### Renk Paleti
- **Ana Renkler**: Sarı (#FFD700) ve Kırmızı (#FF0000) - Galatasaray'ın resmi renkleri
- **Arka Plan**: Gradient (Sarı → Kırmızı)
- **Kartlar**: Beyaz arka plan, yuvarlatılmış köşeler, gölge efektleri

### UI Bileşenleri
- **Header**: Oyun başlığı, zorluk rozeti, geri sayım zamanlayıcısı
- **Harita Bölümü**: Sol tarafta, tam ekran harita, oyuncu bilgisi
- **Skor Tablosu**: Sağ tarafta, anlık skor, doğru/yanlış sayıları
- **Modaller**: Trivia soruları ve bitiş ekranı için overlay'ler

### Responsive Tasarım
- Desktop: 2 sütunlu grid (harita + skor tablosu)
- Mobil: Tek sütun, dikey yerleşim

### Etkileşim Özellikleri
- Harita üzerinde tıklama ile konum seçimi
- Marker ile seçilen konumun gösterilmesi
- Zorluk seviyesine göre zoom kontrolü
- Gerçek zamanlı skor güncellemesi
- Animasyonlu geçişler ve hover efektleri

## 🔧 Özellikler

✅ Otomatik zorluk ilerlemesi (Kullanıcı seçimi yok)  
✅ Rastgele oyuncu ve trivia seçimi  
✅ Reverse geocoding ile ülke tespiti  
✅ Gerçek zamanlı zamanlayıcı  
✅ Skor normalizasyonu ve fan seviyesi hesaplama  
✅ Responsive tasarım  
✅ Modal tabanlı trivia sistemi  
✅ Oyun sonu ekranı ve yeniden oynama  


**Not**: Bu oyun, Galatasaray taraftarlarının coğrafya bilgilerini test etmek ve eğlenceli bir şekilde öğrenmelerini sağlamak amacıyla geliştirilmiştir. ⚽🦁



[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BhShQpq1)
