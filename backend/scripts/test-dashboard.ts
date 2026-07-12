const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Dashboard API Verification Tests (Native Fetch)...\n');

  let token = '';

  // Step 1: Login using verified credentials
  try {
    console.log('👤 Attempting login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@ecosphere.com',
        password: 'TestPass123!'
      })
    });

    const loginData = await loginRes.json() as any;

    if (loginRes.ok && loginData?.success && loginData?.data?.token) {
      token = loginData.data.token;
      console.log('✅ Login Successful! Token acquired.');
    } else {
      console.error('❌ Login failed:', loginData);
      return;
    }
  } catch (error: any) {
    console.error('❌ Login request failed:', error.message);
    console.log('\n💡 Tip: Make sure the backend server is running in another terminal window!');
    return;
  }

  const authHeaders = {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Step 2: Test Summary Endpoint
  try {
    console.log('\n📈 Testing Summary Endpoint: GET /api/dashboard/summary');
    const res = await fetch(`${BASE_URL}/dashboard/summary`, authHeaders);
    const body = await res.json() as any;
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(body, null, 2));
    if (res.ok && body.success && typeof body.data.overallScore === 'number') {
      console.log('✅ Summary Endpoint: PASS');
    } else {
      console.log('❌ Summary Endpoint: FAIL');
    }
  } catch (error: any) {
    console.error('❌ Summary Endpoint Failed:', error.message);
  }

  // Step 3: Test Emission Trend Endpoint
  try {
    console.log('\n📊 Testing Emission Trend: GET /api/dashboard/emission-trend');
    const res = await fetch(`${BASE_URL}/dashboard/emission-trend`, authHeaders);
    const body = await res.json() as any;
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(body, null, 2));
    if (res.ok && body.success && Array.isArray(body.data)) {
      console.log('✅ Emission Trend: PASS');
    } else {
      console.log('❌ Emission Trend: FAIL');
    }
  } catch (error: any) {
    console.error('❌ Emission Trend Failed:', error.message);
  }

  // Step 4: Test Department Ranking Endpoint
  try {
    console.log('\n🏆 Testing Department Ranking: GET /api/dashboard/department-ranking');
    const res = await fetch(`${BASE_URL}/dashboard/department-ranking`, authHeaders);
    const body = await res.json() as any;
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(body, null, 2));
    if (res.ok && body.success && Array.isArray(body.data)) {
      console.log('✅ Department Ranking: PASS');
    } else {
      console.log('❌ Department Ranking: FAIL');
    }
  } catch (error: any) {
    console.error('❌ Department Ranking Failed:', error.message);
  }

  // Step 5: Test Recent Activities Endpoint
  try {
    console.log('\n🔔 Testing Recent Activities: GET /api/dashboard/recent-activities');
    const res = await fetch(`${BASE_URL}/dashboard/recent-activities`, authHeaders);
    const body = await res.json() as any;
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(body, null, 2));
    if (res.ok && body.success && Array.isArray(body.data)) {
      console.log('✅ Recent Activities: PASS');
    } else {
      console.log('❌ Recent Activities: FAIL');
    }
  } catch (error: any) {
    console.error('❌ Recent Activities Failed:', error.message);
  }

  // Step 6: Test Quick Actions Endpoint
  try {
    console.log('\n⚡ Testing Quick Actions: GET /api/dashboard/quick-actions');
    const res = await fetch(`${BASE_URL}/dashboard/quick-actions`, authHeaders);
    const body = await res.json() as any;
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(body, null, 2));
    if (res.ok && body.success && Array.isArray(body.data)) {
      console.log('✅ Quick Actions: PASS');
    } else {
      console.log('❌ Quick Actions: FAIL');
    }
  } catch (error: any) {
    console.error('❌ Quick Actions Failed:', error.message);
  }

  console.log('\n🏁 Dashboard API Verification Tests Complete.');
}

runTests();
