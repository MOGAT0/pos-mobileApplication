import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Dimensions,
  PanResponder,
  Alert,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { API_BASE_URL, API_PORT } from "@env";
import Receipt from "./receipt";
import { getUser } from "./ss_login";
import { router } from "expo-router";
import Config from "./config";
import DateTimePicker from "@react-native-community/datetimepicker";

const TransactionForm = ({
  initialValues = {},
  onChange,
  onSubmit,
  onCancel,
  autoCalc = true,
}) => {
  /*--- table info ---*/
  const [customerName, setCustomerName] = useState("");
  const [container, setContainer] = useState("");
  const [payment, setPayment] = useState("");
  const [balance, setBalance] = useState("");
  const [previousBalance, setPreviousBalance] = useState("0.00");
  const [wcSwap, setWcSwap] = useState("");
  const [posName, setPosName] = useState("test");
  const [area, setArea] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [areaMap, setAreaMap] = useState({});
  const [areaId, setAreaId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [swapContainer, setSwapContainer] = useState("");
  const [daysCounter, setDaysCounter] = useState("");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [total, setTotal] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);

  const [transactionDate, setTransactionDate] = useState(
    initialValues.transactionDate
      ? new Date(initialValues.transactionDate)
      : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* --- Signature state --- */
  const [signatureStrokes, setSignatureStrokes] = useState([]);
  const [signaturePath, setSignaturePath] = useState("");

  const DAYS_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));

  /* --- for auto complete name --- */
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [apiUrl, setapiUrl] = useState("");

  useEffect(() => {
    const fetchAPI = async () => {
      const api_url = await Config.getApiUrl();
      setapiUrl(api_url);
    };
    fetchAPI();
  }, []);

  /* --- for printing --- */
  const receiptRef = useRef(null);

  /*--- get user login ---*/
  useEffect(() => {
    const fetchLoggedUser = async () => {
      const user = await getUser();
      setLoggedUser(user);
    };
    fetchLoggedUser();
  }, []);

  useEffect(() => {
    if (itemName && itemMap[itemName]) {
      setUnitPrice(String(itemMap[itemName].unit_price || 0));
    }
  }, [itemName]);

  /*  Fetch Items & Areas */

  const fetchOptions = async () => {
    try {
      //  Fetch Items
      const itemRes = await fetch(`${apiUrl}?command=fetch_items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({}),
        }).toString(),
      });

      const itemData = await itemRes.json();

      if (
        itemData.error === "none" &&
        itemData.response.items &&
        Array.isArray(itemData.response.items)
      ) {
        setItemOptions(itemData.response.items.map((i) => i.item_name));
        const iMap = {};
        itemData.response.items.forEach((i) => {
          iMap[i.item_name] = { id: i.id, unit_price: i.unit_price };
        });
        setItemMap(iMap);
      }

      //  Fetch Areas
      const areaRes = await fetch(`${apiUrl}?command=fetch_areas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({}),
        }).toString(),
      });

      const areaData = await areaRes.json();
      if (
        areaData.error === "none" &&
        areaData.response.areas &&
        Array.isArray(areaData.response.areas)
      ) {
        setAreaOptions(areaData.response.areas.map((a) => a.name));
        const aMap = {};
        areaData.response.areas.forEach((a) => {
          aMap[a.name] = a.id;
        });
        setAreaMap(aMap);
      }
    } catch (error) {
      console.log("Fetching items/areas failed:", error);
    }
  };

  useEffect(() => {
    if (apiUrl) {
      fetchOptions();
    }
  });

  /* ---------- Auto Calculations ---------- */
  useEffect(() => {
    if (!autoCalc) return;
    const u = parseFloat(unitPrice) || 0;
    const n = parseFloat(container) || 0;
    const t = u * (n > 0 ? n : 1);
    setPrice(u ? u.toFixed(2) : "");
    setTotal(t ? t.toFixed(2) : "");
  }, [unitPrice, container, autoCalc]);

  /* ---------- Memo form state & notify parent ---------- */
  const formState = useMemo(
    () => ({
      customerName,
      area,
      wcSwap,
      container,
      itemName,
      daysCounter,
      unitPrice,
      price,
      total,
      payment,
      signature: signaturePath,
      transactionDate,
    }),
    [
      customerName,
      area,
      wcSwap,
      container,
      itemName,
      daysCounter,
      unitPrice,
      price,
      total,
      payment,
      signaturePath,
      transactionDate,
    ]
  );

  useEffect(() => {
    onChange?.(formState);
  }, [formState]);

  /* --- Signature handlers --- */
  const handleSignatureClear = () => {
    setSignatureStrokes([]);
    setSignaturePath("");
  };

  const handleSignatureSave = () => {
    const path = strokesToSvgPath(signatureStrokes);
    setSignaturePath(path);
  };

  /* --- Cancel & Submit Handlers --- */
  const handleCancel = () => {
    setCustomerName("");
    setArea("");
    setWcSwap("");
    setContainer("");
    setItemName("");
    setDaysCounter("");
    setUnitPrice("");
    setPrice("");
    setTotal("");
    setPayment("");
    handleSignatureClear();
    onCancel?.();
  };

  const handleSubmit = async () => {
    if (!loggedUser?.id) {
      Alert.alert("Error", "You must be logged in to create a transaction.");
      return;
    }

    if (!customerName || !total || !payment || !itemName || !area) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    if (parseFloat(payment) > parseFloat(total)) {
      Alert.alert("Info", "Payment cannot be greater than the total amount.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}?command=create_transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({
            user_id: loggedUser.id,
            customer_name: customerName,
            container: Number(container),
            total_amount: Number(total),
            payment: Number(payment),
            wc_swap: wcSwap || 0,
            pos_name: posName,
            area_id: areaMap[area] || 0,
            unit_price: Number(unitPrice),
            image_base64: signaturePath || null,
            swap_container: Number(container),
            days_counter: Number(daysCounter),
            notes: notes || null,
            item_id: itemMap[itemName].id,
          }),
        }).toString(),
      });
      const json = await response.json();

      if (json.status === "success") {
        Alert.alert("Success", "Transaction created successfully!");
        // print
        await receiptRef.current.printReceipt();
        handleCancel();
        router.push("./MainScreen");
      } else {
        Alert.alert("Error", json.message || "Something went wrong.");
        console.log(json);
      }
    } catch (err) {
      console.log("Submit Error:", err);
      Alert.alert("Error", `Network or server error: ${err.message}`);
    }
  };

  /* --- auto complete functions --- */
  const handleCustomerNameChange = async (text) => {
    setCustomerName(text);

    if (text.length < 2) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}?command=search_customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({ query: text }),
        }).toString(),
      });

      const data = await response.json();
      console.log(data);

      if (data.response && data.response.customers?.length > 0) {
        setCustomerSuggestions(data.response.customers);
        setShowSuggestions(true);
      } else {
        setCustomerSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.log("Suggestion fetch error:", error);
      setCustomerSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCustomer = (name) => {
    setCustomerName(name);
    setShowSuggestions(false);
  };

  /* ---------- Transaction Date Picker ---------- */
  const formatDate = (date) => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setTransactionDate(selectedDate); // update state
      Alert.alert(
        "Selected Date",
        selectedDate.toDateString() // show readable date
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View style={fieldStyles.wrapper}>
          <Text style={fieldStyles.label}>Customer Name</Text>
          <TextInput
            style={fieldStyles.input}
            value={customerName}
            onChangeText={handleCustomerNameChange}
            placeholder="Enter name"
            placeholderTextColor="#999"
          />
          {showSuggestions && customerSuggestions.length > 0 && (
            <View style={suggestionStyles.container}>
              {customerSuggestions.map((name) => (
                <TouchableOpacity
                  key={name}
                  onPress={() => handleSelectCustomer(name)}
                  style={suggestionStyles.item}
                >
                  <Text style={suggestionStyles.text}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Transaction Date Picker */}

        {/* <View style={{ marginBottom: 16 }}>
          <Text style={fieldStyles.label}>Transaction Date</Text>
          <TouchableOpacity
            style={[fieldStyles.input, { justifyContent: "center" }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ fontSize: 16, color: "#000" }}>
              {formatDate(transactionDate)}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={transactionDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}
        </View> */}

        <Dropdown
          label="Area"
          selected={area}
          onSelect={setArea}
          options={areaOptions}
          placeholder="Select area"
        />

        <FormField
          label="Swap"
          value={wcSwap}
          onChangeText={setWcSwap}
          placeholder="Swap value"
          keyboardType="numeric"
        />

        <FormField
          label="No. of Container"
          value={container}
          onChangeText={setContainer}
          placeholder="0"
          keyboardType="numeric"
        />

        <Dropdown
          label="Item Name"
          selected={itemName}
          onSelect={setItemName}
          options={itemOptions}
          placeholder="Select item"
        />

        <Dropdown
          label="Number of Days"
          selected={daysCounter}
          onSelect={setDaysCounter}
          options={DAYS_OPTIONS}
          placeholder="Select days"
        />

        <Row>
          <FormField
            flex
            label="Unit Price"
            value={unitPrice}
            onChangeText={setUnitPrice}
            placeholder="0.00"
            keyboardType="numeric"
            editable={false}
            compact
          />
          <Spacer />
          <FormField
            flex
            label="Total Amount"
            value={total}
            onChangeText={setTotal}
            placeholder="0.00"
            keyboardType="numeric"
            compact
            editable={false}
          />
        </Row>

        <FormField
          label="Payment Amount (Exact Amount)"
          value={payment}
          onChangeText={setPayment}
          placeholder="0.00"
          keyboardType="numeric"
        />

        {/* Signature Section */}
        <Text style={sigStyles.sigLabel}>Signature</Text>
        {!signaturePath ? (
          <>
            <SignaturePad
              strokes={signatureStrokes}
              setStrokes={setSignatureStrokes}
            />
            <View style={sigStyles.sigButtons}>
              <TouchableOpacity
                style={sigStyles.clearBtn}
                onPress={handleSignatureClear}
              >
                <Text style={sigStyles.btnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={sigStyles.saveBtn}
                onPress={handleSignatureSave}
              >
                <Text style={sigStyles.btnTextWhite}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={sigStyles.sigPreview}>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>
              Signature Preview:
            </Text>
            <Svg width="100%" height={150}>
              <Path
                d={signaturePath}
                stroke="#000"
                strokeWidth={2}
                fill="none"
              />
            </Svg>
            <TouchableOpacity
              style={[sigStyles.clearBtn, { marginTop: 8 }]}
              onPress={handleSignatureClear}
            >
              <Text style={sigStyles.btnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={sigStyles.actionButtons}>
          <TouchableOpacity style={sigStyles.cancelBtn} onPress={handleCancel}>
            <Text style={sigStyles.btnTextWhite}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sigStyles.submitBtn} onPress={handleSubmit}>
            <Text style={sigStyles.btnTextWhite}>Submit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 0, width: 0, opacity: 0 }}>
          <Receipt
            ref={receiptRef}
            customer_name={customerName}
            swap={wcSwap}
            container_qty={container}
            unit_price={unitPrice}
            total_amount={total}
            days={daysCounter}
            total_balance={total}
            payment_amount={payment}
            trans_history={new Date().toLocaleDateString()}
            hm_paid={payment}
            balance={Math.max(
              0,
              parseFloat(total) - parseFloat(payment)
            ).toFixed(2)}
            transaction_no={`${Date.now()}`}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ---------------- Dropdown Component ---------------- */
const Dropdown = ({ label, selected, onSelect, options = [], placeholder }) => {
  const [open, setOpen] = useState(false);
  const handlePick = (val) => {
    onSelect(val);
    setOpen(false);
  };
  return (
    <View style={fieldStyles.wrapper}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
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
          {selected || placeholder}
        </Text>
        <Text style={dropdownStyles.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={dropdownStyles.listWrapper}>
          <ScrollView
            style={dropdownStyles.scroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {options.map((opt) => {
              const isSel = opt === selected;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    dropdownStyles.item,
                    isSel && dropdownStyles.itemSelected,
                  ]}
                  onPress={() => handlePick(opt)}
                >
                  <Text
                    style={[
                      dropdownStyles.itemText,
                      isSel && dropdownStyles.itemTextSelected,
                    ]}
                  >
                    {opt}
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

/* ---------------- FormField ---------------- */
const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  compact = false,
  flex = false,
  editable = true,
}) => (
  <View style={[fieldStyles.wrapper, flex && { flex: 1 }]}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TextInput
      style={[
        fieldStyles.input,
        compact && fieldStyles.inputCompact,
        !editable && fieldStyles.inputDisabled,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
      keyboardType={keyboardType}
      editable={editable}
    />
  </View>
);

const Row = ({ children }) => <View style={layoutStyles.row}>{children}</View>;
const Spacer = () => <View style={{ width: 12 }} />;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
});

const suggestionStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 120,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#999",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  inputCompact: { paddingVertical: 8 },
  inputDisabled: { backgroundColor: "#efefef", color: "#555" },
});

const dropdownStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#999",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "space-between",
  },
  buttonOpen: { borderColor: "#58bc82" },
  buttonText: { flex: 1, color: "#000", fontSize: 16 },
  placeholderText: { color: "#999" },
  chevron: { marginLeft: 8, fontSize: 12, color: "#777" },
  listWrapper: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
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
  scroll: { width: "100%", flexGrow: 0 },
  item: { paddingVertical: 10, paddingHorizontal: 16 },
  itemSelected: { backgroundColor: "#E4F5E6" },
  itemText: { fontSize: 16, color: "#0d0c22" },
  itemTextSelected: { color: "#58bc82", fontWeight: "600" },
});

const layoutStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
});

const sigStyles = StyleSheet.create({
  sigLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
    color: "#000",
  },
  sigPadContainer: { alignItems: "center", marginVertical: 12 },
  sigPad: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#999",
    borderRadius: 10,
    overflow: "hidden",
  },
  sigButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: "#58bc82",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  clearBtn: {
    backgroundColor: "#d0d0d0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#000", fontWeight: "600" },
  btnTextWhite: { color: "#fff", fontWeight: "600" },
  sigPreview: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelBtn: {
    backgroundColor: "#d9534f",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#58bc82",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
});

/* ---------------- SignaturePad Component ---------------- */
const SignaturePad = ({ strokes, setStrokes }) => {
  const [currentStroke, setCurrentStroke] = useState([]);
  const startedRef = useRef(false);

  const width = Dimensions.get("window").width * 0.9;
  const height = 150;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          startedRef.current = true;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentStroke([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (evt) => {
          if (!startedRef.current) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentStroke((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
          if (currentStroke.length > 0) {
            setStrokes((prev) => [...prev, currentStroke]);
          }
          setCurrentStroke([]);
          startedRef.current = false;
        },
      }),
    [currentStroke]
  );

  const renderPath = strokesToSvgPath([...strokes, currentStroke]);

  return (
    <View style={sigStyles.sigPadContainer}>
      <View
        style={[sigStyles.sigPad, { width, height }]}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height="100%">
          <Path d={renderPath} stroke="#000" strokeWidth={2} fill="none" />
        </Svg>
      </View>
    </View>
  );
};

/* ---------------- Helper ---------------- */
function strokesToSvgPath(strokesArr) {
  if (!strokesArr || !strokesArr.length) return "";
  return strokesArr
    .map((stroke) => {
      if (!stroke.length) return "";
      const [first, ...rest] = stroke;
      return (
        `M${first.x},${first.y}` + rest.map((p) => ` L${p.x},${p.y}`).join("")
      );
    })
    .join(" ");
}

export default TransactionForm;
