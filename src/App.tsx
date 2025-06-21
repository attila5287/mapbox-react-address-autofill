import { useEffect, useRef, useState } from 'react'
import './App.css'
import { AddressAutofill } from "@mapbox/search-js-react";
import "bootswatch/dist/slate/bootstrap.min.css";
import mapboxgl from 'mapbox-gl';

function App() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    apartment: '',
    city: '',
    state: '',
    country: '',
    postcode: ''
  });
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    // Initialize the map
    mapboxgl.accessToken = "pk.eyJ1IjoiYXR0aWxhNTIiLCJhIjoiY2thOTE3N3l0MDZmczJxcjl6dzZoNDJsbiJ9.bzXjw1xzQcsIhjB_YoAuEw";
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      // denver, colorado
      center: [-104.9903, 39.7589],
      zoom: 18,
      bearing: 50,
      pitch: 60,
      keyboard: true,
      scrollZoom: true,
      doubleClickZoom: true,
      dragPan: true,
      dragRotate: true,
      pitchWithRotate: true,
      touchZoomRotate: true,
    });

    // Store map reference
    mapRef.current = map;

    // Cleanup function
    return () => map.remove();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
  };

  const flyToNewYork = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [-74.006, 40.7128], // New York City coordinates
        zoom: 12,
        duration: 2000 // 2 seconds animation
      });
    }
  };

  const flyToLondon = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [-0.1276, 51.5074], // London coordinates
        zoom: 10,
        duration: 2000
      });
    }
  };

  const flyToAddress = async () => {
    if (!mapRef.current) return;

    // Get address value directly from the input field
    const addressInput = document.querySelector('input[name="address"]') as HTMLInputElement;
    const address = addressInput ? addressInput.value : '';

    // Build the address string from form data
    const addressParts = [
      address,
      formData.city,
      formData.state,
      formData.country,
      formData.postcode
    ].filter(part => part.trim() !== '');

    if (addressParts.length === 0) {
      alert('Please enter an address first');
      return;
    }

    const addressString = addressParts.join(', ');

    try {
      // Use Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressString)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          duration: 2000
        });

        // Add a marker at the location
        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      } else {
        alert('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('Error finding the address. Please try again.');
    }
  };

  return (
    <>
      {/* Toggle Button - Fixed position in top-right corner */}
      <button 
        className="btn btn-primary position-fixed"
        style={{ top: '20px', right: '20px', zIndex: 1000 }}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Hide Form' : 'Show Form'}
      </button>

      {/* Form Card - Conditionally rendered */}
      {showForm && (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ zIndex: 100 }}>
          <div className="card bg-dark bg-opacity-75 text-white" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Address Form</h3>
              <form className="d-flex flex-column gap-3" onSubmit={handleFormSubmit}>
                {/* @ts-ignore */}
                <AddressAutofill accessToken="pk.eyJ1IjoiYXR0aWxhNTIiLCJhIjoiY2thOTE3N3l0MDZmczJxcjl6dzZoNDJsbiJ9.bzXjw1xzQcsIhjB_YoAuEw">
                  <input
                    name="address"
                    placeholder="Address"
                    type="text"
                    autoComplete="address-line1"
                    className="form-control"
                  />
                </AddressAutofill>
                <input
                  name="apartment"
                  placeholder="Apartment number"
                  type="text"
                  autoComplete="address-line2"
                  className="form-control"
                  value={formData.apartment}
                  onChange={handleInputChange}
                />
                <input
                  name="city"
                  placeholder="City"
                  type="text"
                  autoComplete="address-level2"
                  className="form-control"
                  value={formData.city}
                  onChange={handleInputChange}
                />
                <input
                  name="state"
                  placeholder="State"
                  type="text"
                  autoComplete="address-level1"
                  className="form-control"
                  value={formData.state}
                  onChange={handleInputChange}
                />
                <input
                  name="country"
                  placeholder="Country"
                  type="text"
                  autoComplete="country"
                  className="form-control"
                  value={formData.country}
                  onChange={handleInputChange}
                />
                <input
                  name="postcode"
                  placeholder="Postcode"
                  type="text"
                  autoComplete="postal-code"
                  className="form-control"
                  value={formData.postcode}
                  onChange={handleInputChange}
                />
              </form>
              
              <div className="mt-4 d-flex gap-2 justify-content-center flex-wrap">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={flyToNewYork}
                >
                  Fly to New York
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={flyToLondon}
                >
                  Fly to London
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={flyToAddress}
                >
                  Go to Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App
