// removed no longer in use (7/8/25)

const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

// test api
const api_url = "http://localhost/pos_backend/endpoint.php"
const PORT = 3000;

//handle JSON properly

async function handleProxy(url, data) {
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ data: JSON.stringify(data) }),
    });

    const text = await response.text();
    console.log(`Raw Response (${url}):`, text);


    try {
        return JSON.parse(text);
    } catch (e) {
        return { error: "invalid_json_response", raw: text };
    }
}

//Register Endpoint
app.post("/register", async (req, res) => {
    
    try {
        const result = await handleProxy(
            `${api_url}?command=register`,
            req.body
        );
        res.json(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "server error" });
    }
});

//Login Endpoint
app.post("/login", async (req, res) => {
    try {
        const result = await handleProxy(
            `${api_url}?command=login`,
            req.body
        );
        res.json(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "server error" });
    }
});

// create transaction endpoint
app.post("/create_transaction", async (req, res) => {
    console.log(JSON.stringify(req.body));
    
    try {
        const result = await handleProxy(
            `${api_url}?command=create_transaction`,
            req.body
        );
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "server_error" });
    }
});


// Search Customers Endpoint
app.post("/search_customers", async (req, res) => {
  try {
    const result = await handleProxy(
      `${api_url}?command=search_customers`,
      req.body
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Fetch Transactions Endpoint
app.post("/fetch_transactions", async (req, res) => {
  try {
    const result = await handleProxy(
      `${api_url}?command=fetch_transactions`,
      req.body
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Fetch Items Endpoint
app.post("/fetch_items", async (req, res) => {
  try {
    const result = await handleProxy(
      `${api_url}?command=fetch_items`,
      req.body
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Fetch Areas Endpoint
app.post("/fetch_areas", async (req, res) => {
  try {
    const result = await handleProxy(
      `${api_url}?command=fetch_areas`,
      req.body
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "server error" });
  }
});



app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
