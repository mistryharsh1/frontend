// simple mock API to simulate server-side validation and response
export async function register(payload, files=[]) {
  // simulate network delay
  await new Promise((r)=>setTimeout(r, 900 + Math.random()*600));

  // server-side validation examples
  if (!payload.firstName) return { ok:false, status:400, data:{ field:"firstName", message:"First name required" } };
  if (!payload.lastName) return { ok:false, status:400, data:{ field:"lastName", message:"Last name required" } };
  if (!payload.username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.username)) {
    return { ok:false, status:400, data:{ field:"username", message:"Enter a valid email address" } };
  }
  if (payload.username && payload.username.toLowerCase() === "taken@example.com") {
    return { ok:false, status:409, data:{ field:"username", message:"Email already in use" } };
  }
  if (!payload.password || payload.password.length < 8) {
    return { ok:false, status:400, data:{ field:"password", message:"Password must be at least 8 characters" } };
  }
  // simulate successful user
  const user = {
    id: Math.floor(Math.random()*100000).toString(),
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username
  };
  return { ok:true, status:201, data:{ user } };
}
