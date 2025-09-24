import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { API_BASE_URL, API_PORT } from "@env";
import Config from "../components/config";

/* ------------------------------------------------------------------
 * Search Box
 * ------------------------------------------------------------------ */
const SearchBox = ({
  value,
  onChangeText,
  placeholder = "Search",
  style,
  onSubmitEditing,
}) => (
  <View style={[styles.searchWrapOuter, style]}>
    <View style={styles.searchWrapInner}>
      <Svg viewBox="0 0 24 24" style={styles.searchIcon}>
        <Path
          d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"
          fill="#777"
        />
      </Svg>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#777"
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        multiline={false}
        numberOfLines={1}
        scrollEnabled={false}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  </View>
);

/* ------------------------------------------------------------------
 * Area Dropdown (Stores ID but Displays Name)
 * ------------------------------------------------------------------ */
const AreaDropdown = ({
  selected,
  onSelect,
  areas,
  placeholder = "Select area",
  style,
}) => {
  const [open, setOpen] = useState(false);

  const handlePick = (area) => {
    onSelect(area.id);
    setOpen(false);
  };

  const selectedAreaName = areas.find((a) => a.id === selected)?.name || "";

  return (
    <View style={[dropdownStyles.wrapper, style]}>
      <TouchableOpacity
        style={[dropdownStyles.button, open && dropdownStyles.buttonOpen]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            dropdownStyles.buttonText,
            !selected && dropdownStyles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedAreaName || placeholder}
        </Text>
        <Text style={dropdownStyles.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {open && (
        <View style={dropdownStyles.listWrapper}>
          <ScrollView
            style={dropdownStyles.scroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {areas.map((area) => {
              const isSel = area.id === selected;
              return (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    dropdownStyles.item,
                    isSel && dropdownStyles.itemSelected,
                  ]}
                  onPress={() => handlePick(area)}
                >
                  <Text
                    style={[
                      dropdownStyles.itemText,
                      isSel && dropdownStyles.itemTextSelected,
                    ]}
                  >
                    {area.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

/* ------------------------------------------------------------------
 * Screen: Ongoing Transactions
 * ------------------------------------------------------------------ */
const OngoingTransactions = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [areas, setAreas] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setapiUrl] = useState("");

  const fetchAPI = async () => {
    const api_url = await Config.getApiUrl();
    setapiUrl(api_url);
  };
  useEffect(() => {
    fetchAPI();
  }, []);

  /**  Fetch Areas */
  const fetchAreas = async () => {
    try {
      // Show loading placeholder first
      setAreas(["Loading..."]);
      const res = await fetch(`${apiUrl}?command=fetch_areas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({}),
        }).toString(),
      });

      const data = await res.json();

      if (data.response.ok && data.response.areas) {
        setAreas([{ id: "all", name: "All" }, ...data.response.areas]);
      } else {
        console.warn("Failed to fetch areas");
      }
    } catch (error) {
      console.log("Error fetching areas:", error);
    }
  };

  /**  Fetch Transactions */
  const fetchTransactions = async () => {
    if (!search && !area) {
      setTransactions([]);
      return;
    }

    // If "all" is selected, treat it as no filter
    const areaFilter = area === "all" ? "" : area;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}?command=fetch_transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({ search, area: areaFilter }),
        }).toString(),
      });

      const data = await res.json();
      console.log("Fetched Transactions:", data);

      if (data.error === "none") {
        setTransactions(data.response.transactions || []);
      } else {
        console.warn("Error fetching transactions:", data.error);
        setTransactions([]);
      }
    } catch (error) {
      console.log("Network error:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl) {
      fetchAreas();
    }
  }, [apiUrl]);

  useEffect(() => {
    if (apiUrl && (area || search)) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [apiUrl, area, search]);

  const handleSearchSubmit = () => {
    fetchTransactions();
  };

  /**  Group Transactions by Customer */
  const groupedTransactions = transactions.reduce((acc, t) => {
    if (!acc[t.customer_name]) acc[t.customer_name] = [];
    acc[t.customer_name].push(t);
    return acc;
  }, {});

  /**  Get latest row balance for each customer */
  const getLatestBalance = (customerTransactions) => {
    if (!customerTransactions || customerTransactions.length === 0) return 0;
    const latest = customerTransactions.reduce((prev, curr) =>
      new Date(curr.created_at) > new Date(prev.created_at) ? curr : prev
    );
    const balance = parseFloat(latest.balance || 0);
    const prevBalance = parseFloat(latest.previous_balance || 0);
    return balance;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backbtnwrapper}
          onPress={() => router.back()}
        >
          <Image
            source={require("../assets/back .png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headertxt}>Ongoing Transactions</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <SearchBox
          value={search}
          onChangeText={setSearch}
          placeholder="Search customer"
          onSubmitEditing={handleSearchSubmit}
        />

        <AreaDropdown
          selected={area}
          onSelect={setArea}
          areas={areas}
          placeholder="Select area"
          style={styles.areaDropdown}
        />
      </View>

      {/* Transactions List */}
      {loading ? (
        <Text style={{ marginTop: 20, textAlign: "center" }}>Loading...</Text>
      ) : (
        <ScrollView style={{ marginTop: 20 }}>
          {Object.keys(groupedTransactions).length === 0 ? (
            <Text style={{ textAlign: "center", color: "#777" }}>
              No ongoing transactions found.
            </Text>
          ) : (
            Object.keys(groupedTransactions).map((customer, idx) => {
              const transactionsForCustomer = groupedTransactions[customer];
              const latestRow = transactionsForCustomer[0];
              console.log(transactionsForCustomer[0]);

              const totalBalance = getLatestBalance(transactionsForCustomer);

              return (
                <ScrollView
                  key={idx}
                  style={{
                    backgroundColor: "#f8f8f8",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    elevation: 2,
                  }}
                  nestedScrollEnabled={true}
                >
                  <Text
                    style={{ fontWeight: "bold", fontSize: 16, color: "#333" }}
                  >
                    Customer: {customer}
                  </Text>

                  <Text style={{ color: "#555" }}>Area: {latestRow.name}</Text>

                  {/* <Text
                    style={{
                      color: "#9b0000ff",
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}
                  >
                    Balance: {totalBalance.toFixed(2)}
                  </Text> */}

                  <ScrollView
                    style={{ maxHeight: 150, paddingVertical: 4 }}
                    nestedScrollEnabled={true}
                  >
                    {transactionsForCustomer.map((order, oIdx) => (
                      <View
                        key={oIdx}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 6,
                          borderBottomWidth:
                            oIdx === transactionsForCustomer.length - 1 ? 0 : 1,
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <View>
                          <Text style={{ color: "#555" }}>
                            Date:{" "}
                            {new Date(
                              order.created_at.replace(" ", "T")
                            ).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Text>
                          <Text style={{ color: "#333", flex: 1 }}>
                            Item name: {order.item_name}
                          </Text>

                          <Text
                            style={{
                              color: "#9b0000ff",
                              fontWeight: "bold",
                              marginBottom: 8,
                            }}
                          >
                            Balance: {order.balance}
                          </Text>
                        </View>

                        {/* Edit Button */}
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "./editTransaction",
                              params: { id: order.id },
                            })
                          }
                          style={{
                            backgroundColor: "#58bc82",
                            paddingVertical: 4,
                            paddingHorizontal: 10,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "600" }}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </ScrollView>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default OngoingTransactions;

/* ------------------------------------------------------------------
 * Styles
 * ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    position: "relative",
  },
  backbtnwrapper: {
    position: "absolute",
    left: 1,
    padding: 5,
    zIndex: 1,
  },
  backIcon: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
  headertxt: {
    fontSize: 25,
    fontWeight: "600",
    color: "#3f3151",
    left: 20,
  },
  filtersContainer: {
    marginTop: 24,
    width: "100%",
  },
  areaDropdown: {
    marginTop: 16,
  },
  searchWrapOuter: {
    width: "100%",
    padding: 8,
    backgroundColor: "#f5f5f5eb",
    borderRadius: 12,
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#C1D9BF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchWrapInner: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#D9E8D8",
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    width: 16,
    height: 16,
  },
  searchInput: {
    height: "100%",
    paddingLeft: 40,
    paddingRight: 16,
    color: "#0d0c22",
    fontSize: 16,
  },
});

const dropdownStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    zIndex: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9E8D8",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "space-between",
  },
  buttonOpen: {
    borderColor: "#58bc82",
  },
  buttonText: {
    flex: 1,
    color: "#0d0c22",
    fontSize: 16,
  },
  placeholderText: {
    color: "#777",
  },
  chevron: {
    marginLeft: 8,
    fontSize: 12,
    color: "#777",
  },
  listWrapper: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    maxHeight: 180,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  scroll: {
    width: "100%",
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  itemSelected: {
    backgroundColor: "#E4F5E6",
  },
  itemText: {
    fontSize: 16,
    color: "#0d0c22",
  },
  itemTextSelected: {
    color: "#58bc82",
    fontWeight: "600",
  },
});
