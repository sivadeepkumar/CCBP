import "./SearchNew.css";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// components start
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import PropertyTileStay from "../../Components/PropertyTiles/PropertyTileStay";
import { Pagination, Stack } from "@mui/material";
import ModalWrapper from "../../Modals/ModalWrapper/ModalWrapper";
import { MultiRangeSlider } from "../../Components/MultiRangeSlider/MultiRangeSlider";
import { Helmet } from "react-helmet";
import LocationSearch from "../../Components/LocationSearch";
//maps components
import GoogleMapComponent from "./GoogleMapComponent";
import { LoadScript } from "@react-google-maps/api";
// components end

//APi start
import { getSearchDropData, getSubSearchListingsNew } from "../../Apis/Api";
//APi end

//images start
import location_svg from "../../Assets/Images/Search/search_locaton.svg";
import calendar_svg from "../../Assets/Images/Search/calendar.svg";
import man_svg from "../../Assets/Images/Search/man.svg";
import down_arrow_svg from "../../Assets/Images/Search/down-arrow.svg";
import filter_svg from "../../Assets/Images/Search/filter.svg";
import filter_no_svg from "../../Assets/Images/Search/filter_no.svg";
import search_icon from "../../Assets/Images/Search/search_icon.svg";
//images end

//stay static pages start
import WeekendGetaway from "./Stayplannings/WeekendGateway";
import FamilyTrip from "./Stayplannings/FamilyVacation";
import CoupleRetreat from "./Stayplannings/CoupleRetreat";
import Honeymoon from "./Stayplannings/Honeymoon";
import CorporateRetreat from "./Stayplannings/CorporateRetreat";
import NatureRetreatArticle from "./Stayplannings/NatureRetreats";
import PetFriendlyHomestays from "./Stayplannings/PetFriendlyHomestays";
import EcoTourism from "./Stayplannings/EcoTourism";
import FriendsReunion from "./Stayplannings/FriendsReunion";
import FarmStay from "./Stayplannings/FarmStay";
import AdvanturesHomeStays from "./Stayplannings/AdvanturesHomeStays";
import WellnessRetreat from "./Stayplannings/WellnessRetreat";
import CreativeRetreatIndia from "./Stayplannings/CreativeRetreatIndia"
import HeritageHomestaysIndia from "./Stayplannings/HeritageHomestaysIndia"
import AnnivarsaryCelebrations from "./Stayplannings/AnnivarsaryCelebrations"
import BirthdayCelebration from "./Stayplannings/BirthdayCelebration"
import TraditionalHomestay from "./Stayplannings/TraditionalHomestay"
import Workcation from "./Stayplannings/Workcation"
import ArtisticHomestay from "./Stayplannings/ArtisticHomestay"
import SpritualRetreat from "./Stayplannings/SpritualRetreat"
import BudgetFarmhouse from "./Stayplannings/BudgetFarmhouse"
//stay static pages end

//constant start
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_G_KEY;
const STAY_POPULAR_FILTER = [
  {
    name: "Couple Friendly",
    value: "Couple Friendly",
    count: null,
  },
  {
    name: "Free Cancellation",
    value: "Free Cancellation",
    count: null,
  },
  {
    name: "Free Breakfast",
    value: "Free Breakfast",
    count: null,
  },
];
const RULES = [
  {
    name: "Outside food allowed",
    value: "Outside food",
    count: null,
  },
  {
    name: "Loud music allowed",
    value: "Music",
    count: null,
  },
  {
    name: "Inside Smoking allowed",
    value: "Smoking",
    count: null,
  },
  {
    name: "Pets allowed",
    value: "Pets",
    count: null,
  },
];
const AMENITIES = [
  { value: "Outdoor Swimming Pool", name: "Swimming Pool" },
  { value: "Lawn", name: "Lawn" },
  { value: "Bonfire", name: "Bonfire" },
  { value: `Children's Play Area`, name: `Children's Play Area` },
  { value: "Barbeque", name: "Barbeque" },
  { value: `Sun Deck`, name: `Sun Deck` },
  { value: "Outdoor Sports", name: "Outdoor Sports" },
  { value: "Balcony / Terrace", name: "Balcony / Terrace" },
  { value: "Air Conditioning", name: "Air Conditioning" },
  { value: "Wifi", name: "Wi-Fi" },
  { value: "Fire Place", name: "Fire Place" },
  { value: "Steam & Sauna", name: "Steam & Sauna" },
  { value: "Gym/ Fitness Centre", name: "Gym/ Fitness Centre" },
  { value: "Indoor Games", name: "Indoor Games" },
];
const LISTINGSNUMBER = 10;

const ATTENDIES = [
  { value: "1-5", label: "1 - 5 people" },
  { value: "6-15", label: "6 - 15 people" },
  { value: "16-30", label: "16 - 30 people" },
  { value: "31-45", label: "31 - 45 people" },
  { value: "46-60", label: "46 - 60 people" },
  { value: "60-100000", label: "60+ people" },
];
const RADIUS_IN_METERS = 100000; // 100km
//constant end

const SearchStay = () => {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const [init,setInit] = useState(false)
  const params = new URLSearchParams(window.location.search);
  
  // Get page from URL params, default to 1 if not provided
  const getPageFromUrl = () => {
    const currentParams = new URLSearchParams(window.location.search);
    const pageParam = currentParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  };

  const [formData, setFormData] = useState({
    event: "stay",
    city: location?.state?.city,  
    searchInput: "",
    activity: "",
    location: "",
    area: location?.state?.area,
    amenities: [],
    policies: [...(location?.state?.pets ? ["Pets"] : [])],
    adults: location?.state?.adults || 0,
    children: location?.state?.children || 0,
    attendies: location?.state?.attendies || "",
    checkIn: location?.state?.checkIn || "",
    checkOut: location?.state?.checkOut || "",
    eventType: "",
    plateType: "",
    price: { min: 0, max: null },
    country: location?.state?.country || "",
    placeId: location?.state?.place_id || "",
    state: location?.state?.state || "",
    latitude: location?.state?.latitude || 0,
    longitude: location?.state?.longitude || 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [keywords, setKeywords] = useState("");
  const [searchError,setSearchError] = useState("");
  const [properties, setProperties] = useState([]);

  // for map component
  const [placeIds, setPlaceIds] = useState([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [map, setMap] = useState(false);
  useEffect(() => {
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_G_KEY}&libraries=places`;
    if (!(document?.querySelector(`script[src="${scriptUrl}"]`))) {
      setIsScriptLoaded(false);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize page from URL
  const [page, setPage] = useState(() => getPageFromUrl());
  const [pagesCount, setPagesCount] = useState(1);
  const [loader, setLoader] = useState(true);

  const [showFullTypes, setShowFullTypes] = useState(false);
  const [showFullAmenities, setShowFullAmenities] = useState(false);
  const [showFullActivity, setShowFullActivity] = useState(false);
  const [comparedList, setComparedList] = useState([]);
  const [h1,setH1] = useState('')
  const [title,setTitile] = useState('')
  const [description,setDescription] = useState('')
  const [key, setKey] = useState(0);
  const searchTimerRef = useRef(null); // Ref to store the timer ID

  // Debouncer function to update formData after delay
  const debouncedSetFormData = useCallback(
    (value) => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current); // Clear the previous timer
      }

      searchTimerRef.current = setTimeout(() => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          keywords: value,
        }));
      }, 2000); // Adjust delay as needed
    },
    []
  );

  // Helper function to update URL with query parameters
  const updateUrlWithPage = (pageNumber, preserveOtherParams = true) => {
    const currentParams = new URLSearchParams(window.location.search);
    
    if (preserveOtherParams) {
      // Preserve existing query parameters and update page
      currentParams.set('page', pageNumber.toString());
    } else {
      // Clear all params and set only page
      currentParams.clear();
      currentParams.set('page', pageNumber.toString());
    }
    
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    
    // Update URL without page reload
    window.history.pushState({}, '', newUrl);
  };

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  const handleShowAmenities = () => {
    setShowFullAmenities(!showFullAmenities);
  };

  const handleShowActivity = () => {
    setShowFullActivity(!showFullActivity);
  };

  const handleShowTypes = () => {
    setShowFullTypes(!showFullTypes);
  };

  const handleMap = () => {
    setMap(!map);
  };

  const handleChecked = (value) => {
    if (comparedList?.includes(value)) {
      const newArr = comparedList?.filter(function (item) {
        return item !== value;
      });
      setComparedList(newArr);
    } else {
      comparedList.push(value);
      setComparedList([...comparedList]);
    }
  };

  const [activities, setActivities] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const cityRef = useRef(null);
  const searchRef = useRef(null);
  const gSearchRef = useRef(null);
  const [cities, setCities] = useState([]);

  const dateInputRef = useRef(null);
  const dateInputRef2 = useRef(null);
  const handleTextInputClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.setFocus();
    }
  };
  const handleTextInputClick2 = () => {
    if (dateInputRef2.current) {
      dateInputRef2.current.setFocus();
    }
  };
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const attendiesRef = useRef(null);
  const attendiesInputRef = useRef(null);
  const [attendies, setAttendies] = useState("");
  const [showAttendiess, setShowAttendies] = useState(false);
  const [filteredAttedies, setFilteredAttendies] = useState(ATTENDIES);
  const onChangeAttendies = (e) => {
    setAttendies(e.target.value);
    const filteredData = ATTENDIES?.filter((option) =>
      option?.label?.toLowerCase()?.includes(e.target.value.toLowerCase())
    );
    setFilteredAttendies(filteredData);
    if (!e.target.value) {
      setFormData({
        ...formData,
        attendies: "",
      });
    }
  };
  const handleOptionClickAttendies = (option) => {
    setAttendies("");
    setFormData({
      ...formData,
      attendies: option.value,
    });
    setShowAttendies(false);
  };
  const handleAttendiesInputClick = () => {
    setShowAttendies(!showAttendiess);
    if (!showAttendiess && attendiesRef.current) {
      attendiesInputRef.current.focus();
    }
  };
  const getAttendiesValue = () => {
    const selectedAttendiesLabel = ATTENDIES.find(
      (item) => item.value === formData?.attendies
    )?.label;
    return selectedAttendiesLabel;
  };

  const onChangePopular = (value) => {
    if (value === "Free Breakfast") {
      setFormData({
        ...formData,
        mealOption: formData.mealOption === "Free Breakfast" ? "" : value,
      });
      return null;
    }
    if (formData?.policies?.includes(value)) {
      const newArr = formData?.policies?.filter(function (item) {
        return item !== value;
      });
      setFormData({ ...formData, policies: newArr });
    } else {
      formData.policies.push(value);
      setFormData({ ...formData });
    }
  };

  const onChangePropertyType = (e, value) => {
    const {checked} = e?.target;
    const data = {
      ...formData,
      location: checked ? value : "",
    };
    handleUrlChange({...data}, 1); // Reset to page 1 when filters change
    setFormData({...data});
  };

  const onChangeAmenities = (value) => {
    if (formData?.amenities?.includes(value)) {
      const newArr = formData?.amenities?.filter(function (item) {
        return item !== value;
      });
      setFormData({ ...formData, amenities: newArr });
    } else {
      formData.amenities.push(value);
      setFormData({ ...formData });
    }
  };

  const onChangeActivities = (e, value) => {
    const {checked} = e?.target;
    const data = {
      ...formData,
      activity: checked ? value : "",
    }
    handleUrlChange({...data}, 1); // Reset to page 1 when filters change
    setFormData({...data});
  };

  const onChangeAPloicies = (value) => {
    if (formData?.policies?.includes(value)) {
      const newArr = formData?.policies?.filter(function (item) {
        return item !== value;
      });
      setFormData({ ...formData, policies: [...newArr] });
    } else {
      formData.policies.push(value);
      setFormData({ ...formData });
    }
  };

  const onClearFilter = () => {
    setFormData({
      ...formData,
      amenities: [],
      policies: [],
      activity: "",
      location: "",
      mealOption: "",
      price: { min: 0, max: null },
    });
    setKey((prev) => prev + 1);
    // Reset to page 1 when clearing filters
    setPage(1);
    updateUrlWithPage(1, false);
  };

  const userTimeZoneOffset = new Date().getTimezoneOffset();
  const getData = async (pageNumber = 1) => {
    scrollToTop();
    setLoader(true);
    try {
      const resp = await getSubSearchListingsNew(
        { ...formData, userTimeZoneOffset, radiusInMeters : RADIUS_IN_METERS },
        pageNumber,
        LISTINGSNUMBER
      );
      setProperties(resp?.data?.listings);
      setPagesCount(resp?.data?.pagesCount);
      const PLACEIDS = []
      resp?.data?.listings?.map((each) => {
        PLACEIDS.push({placeId: each?.address?.place_id, locationId: each?.location_id});
      })
      setPlaceIds(PLACEIDS)
      if (resp?.data?.listings?.length) {
        if (!map && window.innerWidth > 1200) setMap(true);
      } else {
        setMap(false);
      }
    } catch (error) {
      console.log(error);
    }
    setLoader(false);
  };

  const getDropData = async () => {
    try {
      const resp = await getSearchDropData("stay");
      setCities(resp?.data?.cities);
      setActivities(resp?.data?.activities);
      setPropertyTypes(resp?.data?.propTypes);
    } catch (error) {
      console.log(error);
    }
  };

  // Modified onPageChange to update URL with page parameter
  const onPageChange = (event, newPage) => {
    const PAGE = newPage <= 0 ? 1 : newPage;
    setPage(PAGE);
    updateUrlWithPage(PAGE);
    getData(PAGE);
  };

  const paginationRounded = () => {
    return (
      <Stack className="mt-2 mb-3" spacing={2}>
        <Pagination
          onChange={(event, page) => onPageChange(event, page)}
          count={pagesCount}
          variant="outlined"
          shape="rounded"
          page={page}
        />
      </Stack>
    );
  };

  const handleClickOut = (event) => {
    if (
      attendiesRef.current &&
      !attendiesRef.current.contains(event.target)
    ) {
      setShowAttendies(false);
    }
  };

  const onSubmit = () => {
    if(!searchInput) {
      setSearchError('Select location')
      return null
    }
    setShowSearch(false)
    // Reset to page 1 on new search
    setPage(1);
    updateUrlWithPage(1, false);
    getData(1); 
  };

  const filters = () => {
    return (
      <>
        {showFilter && searchBar()}
        <div className="sp_search_new_filter_wrap_container">
          <span className="sub_text heading_color_1">Popular Filters</span>
          {STAY_POPULAR_FILTER?.map((each, i) => {
            return (
              <div
                key={i}
                className="d-flex flex-row justify-content-between align-items-center w-100 mb-1"
              >
                <div className="d-flex flex-row justify-content-start align-items-center">
                  <input
                    type="checkbox"
                    className="sp_search_new_check"
                    id={each.name}
                    name="popular"
                    onChange={() => onChangePopular(each.value)}
                    checked={
                      formData?.policies?.includes(each.value) ||
                      formData?.mealOption === each.value
                    }
                  />
                  <label
                    htmlFor={each.name}
                    className="content text_color_1 mb-0"
                  >
                    {each.name}
                  </label>
                </div>
                {each.count && (
                  <span className="content text_color_4">({each.count})</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="sp_search_new_filter_wrap_container">
            <span className="sub_text heading_color_1">Price</span>
            <MultiRangeSlider
                key={key}
                min={0}
                max={null}
                data={{
                  "min" : formData?.price?.min,
                  "max" : formData?.price?.max,
                }}
                onSuccess={(min, max) => {
                    setFormData((prevFormData) => {
                      return {
                        ...prevFormData,
                        price : {
                          min,
                          max
                        }
                      }
                    })
                }}
            />
        </div>
        <div className="sp_search_new_filter_wrap_container">
          <span className="sub_text heading_color_1">Space Rules</span>
          {RULES?.map((each, i) => {
            return (
              <div
                key={i}
                className="d-flex flex-row justify-content-between align-items-center w-100 mb-1"
              >
                <div className="d-flex flex-row justify-content-start align-items-center">
                  <input
                    type="checkbox"
                    className="sp_search_new_check"
                    id={each.name}
                    name="policies"
                    onChange={() => onChangeAPloicies(each.value)}
                    checked={formData?.policies?.includes(each.value)}
                  />
                  <label
                    htmlFor={each.name}
                    className="content text_color_ mb-0"
                  >
                    {each.name}
                  </label>
                </div>
                {each.count && (
                  <span className="content text_color_4">({each.count})</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="sp_search_new_filter_wrap_container">
          <span className="sub_text heading_color_1">Property type</span>
          {propertyTypes?.map((each, i) => {
            if (!showFullTypes && i > 5) return null;
            return (
              <div
                key={i}
                className="d-flex flex-row justify-content-between align-items-center w-100 mb-1"
              >
                <div className="d-flex flex-row justify-content-start align-items-center">
                  <input
                    type="checkbox"
                    className="sp_search_new_check"
                    id={each.label}
                    name="location"
                    onChange={(e) => onChangePropertyType(e, each.value)}
                    checked={
                      each.value.toLowerCase() ===
                      formData?.location.toLowerCase()
                    }
                  />
                  <label
                    htmlFor={each.label}
                    className="content text_color_1 mb-0"
                  >
                    {each.label}
                  </label>
                </div>
                {each.count && (
                  <span className="content text_color_4">({each.count})</span>
                )}
              </div>
            );
          })}
          <span className="sub_text required cursor" onClick={handleShowTypes}>
            {showFullTypes ? "- SHOW LESS" : "+ SHOW ALL"}
          </span>
        </div>
        <div className="sp_search_new_filter_wrap_container">
          <span className="sub_text heading_color_1">Amenities</span>
          {AMENITIES?.map((each, i) => {
            if (!showFullAmenities && i > 5) return null;
            return (
              <div
                key={i}
                className="d-flex flex-row justify-content-between align-items-center w-100 mb-1"
              >
                <div className="d-flex flex-row justify-content-start align-items-center">
                  <input
                    type="checkbox"
                    className="sp_search_new_check"
                    id={each.name}
                    name="amenities"
                    onChange={() => onChangeAmenities(each.value)}
                    checked={formData?.amenities?.includes(each.value)}
                  />
                  <label
                    htmlFor={each.name}
                    className="content text_color_1 mb-0"
                  >
                    {each.name}
                  </label>
                </div>
                {each.count && (
                  <span className="content text_color_4">({each.count})</span>
                )}
              </div>
            );
          })}
          <span
            className="sub_text required cursor"
            onClick={handleShowAmenities}
          >
            {showFullAmenities ? "- SHOW LESS" : "+ SHOW ALL"}
          </span>
        </div>
        <div className="sp_search_new_filter_wrap_container">
          <span className="sub_text heading_color_1">Activities</span>
          {activities?.map((each, i) => {
            if (!showFullActivity && i > 5) return null;
            return (
              <div
                key={i}
                className="d-flex flex-row justify-content-between align-items-center w-100 mb-1"
              >
                <div className="d-flex flex-row justify-content-start align-items-center">
                  <input
                    type="checkbox"
                    className="sp_search_new_check"
                    id={each.label}
                    name="amenities"
                    onChange={(e) => onChangeActivities(e, each.value)}
                    checked={
                      each.value.toLowerCase() ===
                      formData?.activity.toLowerCase()
                    }
                  />
                  <label
                    htmlFor={each.label}
                    className="content text_color_1 mb-0"
                  >
                    {each.label}
                  </label>
                </div>
                {each.count && (
                  <span className="content text_color_4">({each.count})</span>
                )}
              </div>
            );
          })}
          <span
            className="sub_text required cursor"
            onClick={handleShowActivity}
          >
            {showFullActivity ? "- SHOW LESS" : "+ SHOW ALL"}
          </span>
        </div>
        <div className="sp_search_new_filter_button_wrap flex-column justify-content-center align-items-center w-100">
          <button
            type="button"
            onClick={() => {
              onSubmit();
              setShowFilter(false);
            }}
            className="sp_button btn btn-primary mb-2 w-100"
          >
            Apply Filter
          </button>
          <button
            type="button"
            onClick={() => {
              onClearFilter();
              setShowFilter(false);
            }}
            className="sp_button btn btn-dark w-100"
          >
            Clear Filter
          </button>
        </div>
      </>
    );
  };

  const [showFilter, setShowFilter] = useState(false);
  const onFilterClick = () => {
    setShowFilter(!showFilter);
  };
  const handleFilterClose = () => {
    setShowFilter(!showFilter);
  };

  const [showSearch, setShowSearch] = useState(false);
  const onSearchClick = () => {
    setShowSearch(true);
  };
  const handleSearchClose = () => {
    setShowSearch(false);
  };
  const onChangeSearch = (e) => {
    const { value } = e?.target;
    setKeywords(value);
    debouncedSetFormData(value);
  };

  const handleLocationSelect = (inData, searchInput) => {
    const data = {
      ...formData,
      city: inData?.city,
      area: inData?.area,
      country: inData?.country || "",
      placeId: inData?.place_id || "",
      state: inData?.state || "",
      latitude: inData?.latitude || 0,
      longitude: inData?.longitude || 0,
      searchInput: searchInput,
    }
    setSearchInput(searchInput);
    setSearchError('');
    handleUrlChange(data, 1); // Reset to page 1 when location changes
  }

  const handleSearch = () => {
    setSearchInput('');
  }

  const gSearchBar = (prop) => {
    return(
      <div 
        className={`d-flex flex-column justify-content-center align-items-center w-100`}
        style={prop ? { maxWidth: "407px" }  : { maxWidth: "500px", flexGrow:1 }}
      >
        <div
          className={`sp_search_new_search_item`}
          style={prop ? { maxWidth: "407px" } : { maxWidth: "500px" }}
          ref={gSearchRef}
        >
          <img src={location_svg} />
          <div className="d-flex flex-column w-100">
            <span className="content ">Where...</span>
            <LocationSearch handleSearch={handleSearch} searchInputIn={searchInput} handleLocationSelect={(data,searchInput)=> handleLocationSelect(data,searchInput)}/>
          </div>
        </div>
        {searchError && <span className={`required content text-start w-100`} style={{ maxWidth: "407px" }}>{searchError}</span>}
      </div>
    )
  }

  const searchBar = () => {
    return (
      <div className="sp_id_name_search_container">
        <div className="sp_id_name_search">
          <svg className="sp_id_name_icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
          <input 
            placeholder="Search By Property Name or ID" 
            type="text" 
            className="sp_id_name_input sp_input_placeholder"
            value={keywords || ""}
            onChange={onChangeSearch}
          />
        </div>
      </div>
    )
  }

  const search = (prop) => {
    return (
      <>
        {gSearchBar(prop)}
        <div
          className="sp_search_new_search_item cursor sp_search_bar_new_search_item_3"
          style={prop && { maxWidth: "407px" }}
          onClick={handleTextInputClick}
        >
          <img src={calendar_svg} />
          <div className="d-flex flex-column">
            <span className="content">Check In</span>
            <input
              className="sp_search_input sp_input_placeholder"
              type="text"
              name="checkIn"
              value={formData?.checkIn}
              readOnly
              placeholder="Select date"
            />
            <DatePicker
                selected={new Date(formData?.checkIn || new Date())}
                onChange={(date) => {
                    onChange({ target: { name: "checkIn", value: date.toISOString().split("T")[0] } });
                }}
                onSelect={() => {
                    setTimeout(() => {
                        if (dateInputRef.current) {
                            dateInputRef.current.setOpen(false);
                        }
                    }, 100);
                }}
                className="sp_input"
                placeholderText="Select date"
                minDate={new Date()}
                maxDate={formData?.checkOut ? new Date(new Date(formData.checkOut).setDate(new Date(formData.checkOut).getDate() - 1)) : undefined}
                ref={dateInputRef}
                onClickOutside={() => {
                    if (dateInputRef.current) {
                        dateInputRef.current.setOpen(false);
                    }
                }}
            />
          </div>
        </div>
        <div
          className="sp_search_new_search_item cursor sp_search_bar_new_search_item_3"
          style={prop && { maxWidth: "407px" }}
          onClick={handleTextInputClick2}
        >
          <img src={calendar_svg} />
          <div className="d-flex flex-column">
            <span className="content ">Check Out</span>
            <input
              className="sp_search_input sp_input_placeholder"
              type="text"
              name="checkOut"
              value={formData?.checkOut}
              readOnly
              placeholder="Select dates"
            />
            <DatePicker
              selected={formData?.checkOut ? new Date(formData.checkOut) : new Date()}
              onChange={(date) => {
                  onChange({
                      target: { name: "checkOut", value: date.toISOString().split("T")[0] },
                  });
              }}
              onSelect={() => {
                  setTimeout(() => {
                      if (dateInputRef2.current) {
                          dateInputRef2.current.setOpen(false);
                      }
                  }, 100);
              }}
              className="sp_input"
              placeholderText="Select date"
              minDate={new Date(
                  new Date(formData?.checkIn || new Date()).setDate(
                      new Date(formData?.checkIn || new Date()).getDate() + 1
                  )
              )}
              ref={dateInputRef2}
              onClickOutside={() => {
                  if (dateInputRef2.current) {
                      dateInputRef2.current.setOpen(false);
                  }
              }}
            />
          </div>
        </div>
        <div
          className="sp_search_new_search_item cursor"
          style={prop ? { maxWidth: "407px" } : { maxWidth: "230px" }}
          ref={attendiesRef}
          onClick={handleAttendiesInputClick}
        >
          <img src={man_svg} />
          <div className="d-flex flex-column w-100">
            <span className="content">No. of Guests</span>
            <span ref={attendiesInputRef} className="content text_color_3">
              {parseInt(formData?.adults, 10) > 0
                ? `${formData?.adults} Adult${parseInt(formData?.adults, 10) > 1 ? "s" : ""}`
                : ""}

              {parseInt(formData?.children, 10) > 0
                ? `${parseInt(formData?.adults, 10) > 0 ? ", " : ""}${formData?.children} Child${parseInt(formData?.children, 10) > 1 ? "ren" : ""}`
                : ""}
            </span>
          </div>
          <img src={down_arrow_svg} />
          {showAttendiess && (
            <div className="sp_pp_booking_stay_guests_rooms_input_dropdown sp_pp_booking_stay_guests_rooms_input_dropdown_2">
              <div className="sp_pp_booking_stay_guests_rooms_input_dropdown_sub">
                <div className="sp_pp_booking_stay_guests_rooms_sub">
                  <div className="d-flex flex-column">
                    <span className="content text_color_1">Adults</span>
                    <span className="content text_color_1" style={{ fontSize: "10px" }}>Ages 13 or above</span>
                  </div>
                  <div className="sp_pp_booking_stay_guest_box_selection">
                    <div onClick={(e) => {
                      e?.stopPropagation();
                      updateAdults('-', formData?.adults);
                    }} className="cursor"><span className="content text_color_1 text-center">-</span></div>
                    <span className="content text_color_1 text-center">{formData?.adults}</span>
                    <div onClick={(e) => {
                      e?.stopPropagation();
                      updateAdults('+', formData?.adults);
                    }} className="cursor"><span className="content text_color_1 text-center">+</span></div>
                  </div>
                </div>
                <div className="sp_pp_booking_stay_guests_rooms_sub">
                  <div className="d-flex flex-column">
                    <span className="content text_color_1">Children</span>
                    <span className="content text_color_1" style={{ fontSize: "10px" }}>Ages 0 to 12</span>
                  </div>
                  <div className="sp_pp_booking_stay_guest_box_selection">
                    <div onClick={(e) => {
                      e?.stopPropagation();
                      updateChildren('-', formData?.children);
                    }} className="cursor"><span className="content text_color_1 text-center">-</span></div>
                    <span className="content text_color_1 text-center">{formData?.children}</span>
                    <div onClick={(e) => {
                      e?.stopPropagation();
                      updateChildren('+', formData?.children);
                    }} className="cursor"><span className="content text_color_1 text-center">+</span></div>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="sp_pp_booking_types_checkbox_container mt-1" style={{ paddingLeft: "8px" }}>
                  <input
                    type="checkbox"
                    className="sp_check"
                    name="pets"
                    id="pets"
                    checked={formData?.policies?.includes("Pets")}
                    onChange={() => onChangeAPloicies("Pets")}
                  />
                  <label htmlFor="pets" className="content mb-0 d-flex flex-column">
                    <span className="content text_color_1"> I am travelling with Pets </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onSubmit}
          className="sp_button btn btn-primary sp_search_new_search_button"
          style={prop ? { maxWidth: "407px" } : { maxWidth: "360px" }}
        >
          Search
        </button>
      </>
    );
  };

  // for guest dropdown start
  const updateAdults = (type, value) => {
    if (type === '-') {
      if (value <= 0) return null
      setFormData((prev) => {
        return {
          ...prev,
          adults: prev.adults - 1,
        }
      })
    }
    if (type === '+') {
      setFormData((prev) => {
        return {
          ...prev,
          adults: prev.adults + 1,
        }
      })
    }
  }

  const updateChildren = (type, value) => {
    if (type === '-') {
      if (value <= 0) return null
      setFormData((prev) => {
        return {
          ...prev,
          children: prev.children - 1,
        }
      })
    }
    if (type === '+') {
      setFormData((prev) => {
        return {
          ...prev,
          children: prev.children + 1,
        }
      })
    }
  }
  // for guest dropdown end

  useEffect(() => {
    document.addEventListener("click", handleClickOut);
    return () => {
      document.removeEventListener("click", handleClickOut);
    };
  }, []);

  const DEBOUNCE_DELAY = 500;
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only call getData if not on page 1 or if this is the initial load
      if (page === 1 || init) {
        getData(page);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler); // cleanup if formData changes again before timeout
  }, [formData]);

  // Modified handleUrlChange to accept page parameter
  const handleUrlChange = (data, pageNumber = page) => {
    let navigatePath = '/stay/search/'
    if(data?.location && data?.activity && data?.city){
        navigatePath = navigatePath + data?.location?.replaceAll(' ','-')?.toLowerCase() + 's-for-' + data?.activity?.replaceAll(' ','-')?.toLowerCase() + '-in-' + data?.city?.replaceAll(' ','-')?.toLowerCase()
                 navigate(navigatePath,{ state: { ...data } });
         // Always update URL with page parameter
         updateUrlWithPage(pageNumber, false);
        return null
    }
    if(data?.location && data?.activity){
      navigatePath = navigatePath + data?.location?.replaceAll(' ','-')?.toLowerCase() + 's-for-' + data?.activity?.replaceAll(' ','-')?.toLowerCase()
      navigate(navigatePath,{ state: { ...data } });
      updateUrlWithPage(pageNumber, false);
      return null
    }
    if(data?.location && data?.city){
        navigatePath = navigatePath + data?.location?.replaceAll(' ','-')?.toLowerCase() + 's-for-stay-in-' + data?.city?.replaceAll(' ','-')?.toLowerCase()
        navigate(navigatePath,{ state: { ...data } });
        updateUrlWithPage(pageNumber, false);
        return null
    }
    if(data?.activity && data?.city){
        navigatePath = navigatePath + 'stays-for-' + data?.activity?.replaceAll(' ','-')?.toLowerCase() + '-in-' + data?.city?.replaceAll(' ','-')?.toLowerCase()
        navigate(navigatePath,{ state: { ...data } });
        updateUrlWithPage(pageNumber, false);
        return null
    }
    if(data?.city){
        navigatePath = navigatePath + 'hotels-and-places-for-stay-in-' + data?.city?.replaceAll(' ','-')?.toLowerCase()
        navigate(navigatePath,{ state: { ...data } });
        updateUrlWithPage(pageNumber, false);
        return null
    }
    if(data?.activity){
      navigatePath = navigatePath + 'stays-for-' + data?.activity?.replaceAll(' ','-')?.toLowerCase()
      navigate(navigatePath,{ state: { ...data } });
      updateUrlWithPage(pageNumber, false);
      return null
    }
    if(data?.location){
        navigatePath = navigatePath + data?.location?.replaceAll(' ','-')?.toLowerCase() + 's-for-stay'
        navigate(navigatePath,{ state: { ...data } });
        updateUrlWithPage(pageNumber, false);
        return null
    }
    navigate(navigatePath,{ state: { ...data } })
    updateUrlWithPage(pageNumber, false);
  };

  const func = (text) => {
    let result = []
    if (text?.includes('hotels-and-places-for-stay-in-')) {
      result = text?.split(`hotels-and-places-for-stay-in-`);
      setFormData({
        ...formData,
        city: result[1] ? result[1]?.replaceAll("-", " ") : "",
        area: location?.state?.area || "",
        country: location?.state?.country || "",
        placeId: location?.state?.place_id || "",
        state: location?.state?.state || "",
        latitude: location?.state?.latitude || 0,
        longitude: location?.state?.longitude || 0,
      });
      if(location?.state?.searchInput) setSearchInput(location?.state?.searchInput)
             setH1(`Search and Book Top Hotels and Places for Stay in ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}`)
       setTitile(`Best Hotels and Places for Stay in ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} - Book Your Stay Today`)
       setDescription(`Discover the best hotels and places for stay in ${result[1]?.replaceAll("-", " ")}, Explore and choose from a variety of cozy stays, luxury getaways, or budget-friendly options, Book now!`)
       // Keep the page from URL, don't reset to 1
       if (!init) {
         const urlPage = getPageFromUrl();
         setPage(urlPage);
       }
      return null
    }
    if (text?.includes('s-for-stay-in-')) {
      result = text?.split('s-for-stay-in-');
      setFormData({
        ...formData,
        city: result[1] ? result[1]?.replaceAll("-", " ") : "",
        location: result[0] ? result[0]?.replaceAll("-", " ") : "",
        area: location?.state?.area || "",
        country: location?.state?.country || "",
        placeId: location?.state?.place_id || "",
        state: location?.state?.state || "",
        latitude: location?.state?.latitude || 0,
        longitude: location?.state?.longitude || 0,
      });
      if(location?.state?.searchInput) setSearchInput(location?.state?.searchInput)
             setH1(`Search and Book Top ${result[0]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}s for Stay in ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}`)
       setTitile(`Best ${result[0]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}s for Stay in ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} - Book Your Stay Today`)
       setDescription(`Discover the best ${result[0]?.replaceAll("-", " ")}s for stay in ${result[1]?.replaceAll("-", " ")}, Explore and choose from a variety of cozy stays, luxury getaways, or budget-friendly options, Book now!`)
       if (!init) {
         const urlPage = getPageFromUrl();
         setPage(urlPage);
       }
      return null
    }
    if (text?.includes('s-for-stay')) {
      result = text?.split('s-for-stay');
      setFormData({
        ...formData,
        location: result[0] ? result[0]?.replaceAll("-", " ") : "",
        area: location?.state?.area || "",
        country: location?.state?.country || "",
        placeId: location?.state?.place_id || "",
        state: location?.state?.state || "",
        latitude: location?.state?.latitude || 0,
        longitude: location?.state?.longitude || 0,
      });
      if(location?.state?.searchInput) setSearchInput(location?.state?.searchInput)
             setH1(`Search and Book Top ${result[0]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}s for Stay`)
       setTitile(`Best ${result[0]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}s for Stay - Book Your Stay Today`)
       setDescription(`Discover the best ${result[0]?.replaceAll("-", " ")}s for stay, Explore and choose from a variety of cozy stays, luxury getaways, or budget-friendly options, Book now!`)
       if (!init) {
         const urlPage = getPageFromUrl();
         setPage(urlPage);
       }
      return null
    }
    if (text?.includes('stays-for-') && text?.includes('-in-')) {
      result = text?.split('-in-');
      setFormData({
        ...formData,
        city: result[1] ? result[1]?.replaceAll("-", " ") : "",
        activity: result[0] ? result[0]?.replace("stays-for-", "")?.replaceAll("-", " ") : "",
        area: location?.state?.area || "",
        country: location?.state?.country || "",
        placeId: location?.state?.place_id || "",
        state: location?.state?.state || "",
        latitude: location?.state?.latitude || 0,
        longitude: location?.state?.longitude || 0,
      });
      if(location?.state?.searchInput) setSearchInput(location?.state?.searchInput)
             setH1(`Search and Book Top Stays for ${result[0]?.replace("stays-for-", "")?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} in ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}`)
       setTitile(`Best Stays for ${result[0]?.replace("stays-for-", "")?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} in ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} - Book Your Stay Today`)
       setDescription(`Discover the best stays for ${result[0]?.replace("stays-for-", "")?.replaceAll("-", " ")} in ${result[1]?.replaceAll("-", " ")}, Explore and choose from a variety of cozy stays, luxury getaways, or budget-friendly options, Book now!`)
       if (!init) {
         const urlPage = getPageFromUrl();
         setPage(urlPage);
       }
      return null
    }
    if (text?.includes('s-for-') && text?.includes('-in-')) {
        result = text?.split(/s-for-|-in-/);
        setFormData({
          ...formData,
          city: result[2] ? result[2]?.replaceAll("-", " ") : "",
          activity: result[1] ? result[1]?.replaceAll("-", " ") : "",
          location: result[0] ? result[0]?.replaceAll("-", " ") : "",
          area: location?.state?.area || "",
          country: location?.state?.country || "",
          placeId: location?.state?.place_id || "",
          state: location?.state?.state || "",
          latitude: location?.state?.latitude || 0,
          longitude: location?.state?.longitude || 0,
        });
        if(location?.state?.searchInput) setSearchInput(location?.state?.searchInput)
                 setH1(`Search and Book Top ${result[0]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}s for ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} in ${result[2]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}`)
         setTitile(`Best ${result[0]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}s for ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} in ${result[2]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} - Book Your Stay Today`)
         setDescription(`Discover the best ${result[0]?.replaceAll("-", " ")}s for ${result[1]?.replaceAll("-", " ")} in ${result[2]?.replaceAll("-", " ")}, Explore and choose from a variety of cozy stays, luxury getaways, or budget-friendly options, Book now!`)
         if (!init) {
           const urlPage = getPageFromUrl();
           setPage(urlPage);
         }
        return null
    }
    if (text?.includes('stays-for-')) {
      result = text?.split('stays-for-');
      setFormData({
        ...formData,
        activity: result[1] ? result[1]?.replaceAll("-", " ") : "",
        area: location?.state?.area || "",
        country: location?.state?.country || "",
        placeId: location?.state?.place_id || "",
        state: location?.state?.state || "",
        latitude: location?.state?.latitude || 0,
        longitude: location?.state?.longitude || 0,
      });
      if(location?.state?.searchInput) setSearchInput(location?.state?.searchInput)
             setH1(`Search and Book Top Stays for ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())}`)
       setTitile(`Best Stays for ${result[1]?.replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase())} - Book Your Stay Today`)
       setDescription(`Discover the best stays for ${result[1]?.replaceAll("-", " ")}, Explore and choose from a variety of cozy stays, luxury getaways, or budget-friendly options, Book now!`)
       if (!init) {
         const urlPage = getPageFromUrl();
         setPage(urlPage);
       }
      return null
    }
    if(location?.state?.searchInput) setSearchInput(location?.state?.searchInput)
    setFormData({
      ...formData,
      country: location?.state?.country || "",
      placeId: location?.state?.place_id || "",
      state: location?.state?.state || "",
      latitude: location?.state?.latitude || 0,
      longitude: location?.state?.longitude || 0,
    })
         setH1('')
     setTitile('SpotLet')
     setDescription('')
     if (!init) {
       const urlPage = getPageFromUrl();
       setPage(urlPage);
     }
  }

  useEffect(() => {
    const segments = pathname?.split("/");
    const text = segments?.[3];
    func(text)
    if(cities?.length === 0) getDropData()
    setInit(true)
  }, [pathname,location]);

  // Ensure page parameter is always in URL
  useEffect(() => {
    if (init) {
      const currentParams = new URLSearchParams(window.location.search);
      if (!currentParams.has('page')) {
        currentParams.set('page', page.toString());
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [init, page]);

  useEffect(() => {
    const hasParams = Array.from(params.keys()).length > 0;

    if (!location.state && hasParams) {
      const stateFromParams = {
        city: params.get("city") || "",
        activity: params.get("activity") || "",
        area: params.get("area") || "",
        policies: params.get("pets") ? ["Pets"] : [],
        adults: Number(params.get("adults")) || 0,
        children: Number(params.get("children")) || 0,
        attendies: params.get("attendies") || "",
        checkIn: params.get("checkIn") || "",
        checkOut: params.get("checkOut") || "",
        country: params.get("country") || "",
        place_id: params.get("placeId") || "",
        state: params.get("state") || "",
        latitude: Number(params.get("latitude") || 0),
        longitude: Number(params.get("longitude") || 0),
        searchInput: params.get("searchInput") || "",
      };

      const cleanPathname = window.location.pathname.replace(/\/$/, '');

      setFormData({
        ...formData,
        ...stateFromParams,
      });

      navigate(cleanPathname, {
        state: {...stateFromParams},
        replace: true,
      });
    }
  }, []);

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const newPage = getPageFromUrl();
      setPage(newPage);
      getData(newPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="Spotlet">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <Header />
      <div className="sp_search_new_mini_header cursor" onClick={onSearchClick}>
        <span className="content text_color_2">Search Here...</span>
        <img src={search_icon} />
      </div>
      <div className="sp_search_new_main_2">
        <div className="sp_seach_new_header">{search()}</div>
      </div>
      <div className="sp_search_new_main_3">
        <div className="d-flex flex-row justify-content-between w-100">
          <div className="sp_search_new_sort_header w-100 mb-1">
            <span className="sub_text heading_color_1">Search Results:</span>
            {(formData?.city || formData?.location || formData?.activity) ? (
              <h1 className="sub_text brand_color m-0"> {h1}</h1>
            ) : (formData?.searchInput) && <h1 className="sub_text brand_color m-0">Based on the search input - {formData?.searchInput}</h1>}
          </div>
          {placeIds?.length > 0 && (
            <div className="sp_search_new_search_sort_item sp_search_map cursor" onClick={handleMap}>
              <span className="content">Map</span>
              <div className="sp-toggle-container">
                <div className="sp-switch">
                  <input
                    type="checkbox"
                    checked={map}
                  />
                  <span className="sp-slider" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="sp_search_new_mini_filter_header mb-2">
          <div
            className="sp_search_new_mini_button cursor mt-2"
            onClick={onFilterClick}
            style={{ backgroundColor: showFilter ? "#EA4335" : "#ffffff" }}
          >
            <img src={showFilter ? filter_svg : filter_no_svg} alt="filter" />
            <span
              className={`content ${showFilter ? "heading_color_2" : "heading_color-1"
                }`}
            >
              Filters
            </span>
          </div>
        </div>
      </div>
        <div className="sp_seach_new_main">
        <div className="sp_search_new_sub_main">
          <div
            className="sp_search_new_filter_main"
            style={{ ...((map && properties?.length > 0) ? {} : { width: "30%" }) }}
          >
            <div className="sp_search_new_filter_wrap_container">
              {searchBar()}
              <div className="d-flex flex-row justify-content-between align-items-center w-100 mb-1">
                <span className="main_text heading_color_1">Filters</span>
                <span
                  onClick={onClearFilter}
                  className="sub_text heading_color_1 cursor"
                >
                  Clear
                </span>
              </div>
            </div>
            {filters()}
          </div>
          <div
            className="sp_search_new_property_main"
            style={{ ...((map && properties?.length > 0) ? {} : { width: "70%" }) }}
          >
            {loader ? (
              <div className="sp_loading_wrap">
                <span>Loading...</span>
              </div>
            ) : (
              <>
                {properties?.length > 0 ? (
                  <>
                    {properties?.map((listing, index) => (
                      <PropertyTileStay
                        key={index}
                        data={listing}
                        index={index}
                        handleChecked={handleChecked}
                        comparedList={comparedList}
                        formData={formData}
                      />
                    ))}
                    <div className="d-flex justify-content-center w-100">
                      {pagesCount > 1 && paginationRounded()}
                    </div>
                  </>
                ) : (
                    <div className="sp_loading_wrap">
                    <span className="sub_text heading_color_1 text">
                      No Listings Found
                    </span>
                    <span className="content text-center">
                      Thank you for your interest! Unfortunately, there are no
                      listings available at the moment. Please check back later
                      or refine your search to help us find the perfect option
                      for you.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          {placeIds?.length > 0 && (
            <>
              {!isScriptLoaded ? (
                <>
                  {map && (
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
                      <div className="sp_search_new_map_main sp_search_map">
                        <GoogleMapComponent placeIds={placeIds} />
                      </div>
                    </LoadScript>
                  )}
                </>
              ) : (
                <>
                  {map && (
                      <div className="sp_search_new_map_main sp_search_map">
                        <GoogleMapComponent placeIds={placeIds}/>
                      </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="sp_seach_new_main">
         {formData?.activity=== "weekend getaway" &&<WeekendGetaway />}
         {formData?.activity=== "family vacation" && <FamilyTrip />}
         {formData?.activity=== "couple retreat" && <CoupleRetreat/>}
         {formData?.activity=== "honeymoon" && <Honeymoon />}
         {formData?.activity=== "corporate retreat" && <CorporateRetreat />}
         {formData?.activity=== "nature retreat" && <NatureRetreatArticle />}
         {formData?.activity=== "pet friendly homestay" &&  <PetFriendlyHomestays />}
         {formData?.activity=== "eco tourism homestay" && <EcoTourism />}
         {formData?.activity=== "farm stay" && <FarmStay />}
         {formData?.activity=== "friends reunion" && <FriendsReunion />}
         {formData?.activity=== "adventure homestay" && <AdvanturesHomeStays />}
         {formData?.activity=== "wellness retreat" && <WellnessRetreat />}
         {formData?.activity=== "creative retreat" && <CreativeRetreatIndia />}
         {formData?.activity=== "heritage homestay" && <HeritageHomestaysIndia />}
         {formData?.activity=== "anniversary celebration" && <AnnivarsaryCelebrations />}
         {formData?.activity=== "birthday celebration" && <BirthdayCelebration />}
         {formData?.activity=== "spiritual retreat" && <SpritualRetreat/>}
         {formData?.activity=== "workcation" && <Workcation />}
         {formData?.activity=== "artistic homestay" && <ArtisticHomestay />}
         {formData?.activity=== "traditional homestay" && <TraditionalHomestay/>}
         {formData?.activity==="farm house" && <BudgetFarmhouse />}
      </div>
      <Footer />
      {showFilter && (
        <ModalWrapper
          heading={"Filters"}
          size={"lg"}
          props={{ onHide: handleFilterClose, show: showFilter }}
        >
          {filters()}
        </ModalWrapper>
      )}

      {showSearch && (
        <ModalWrapper
          heading={"Search Here"}
          size={"md"}
          props={{ onHide: handleSearchClose, show: showSearch }}
        >
          <div className="sp_seach_new_header_wrap">{search("mobile")}</div>
        </ModalWrapper>
      )}
    </div>
  );
};
export default SearchStay;