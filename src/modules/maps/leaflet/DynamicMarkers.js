const DynamicMarkers = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const { lat, lng } = markers[0];
      map.setView([lat, lng], 13); // Centrare sul primo marker
    }

    markers.forEach((marker, index) => {
      if (marker.lat && marker.lng) {
        const customIcon = new L.Icon({
          iconUrl: marker.icon || "https://cdn-icons-png.freepik.com/512/46/46350.png", // Default fallback icon
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        L.marker([marker.lat, marker.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(marker.popup || "Nessun dato");
      }
    });

    // Pulizia dei marker
    return () => {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
    };
  }, [markers, map]);

  return null;
};

DynamicMarkers.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      icon: PropTypes.string, // URL dell'icona
      popup: PropTypes.string, // Contenuto del popup
    })
  ),
};
