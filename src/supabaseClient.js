import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yiszwmmtpvkygsjpyxke.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc3p3bW10cHZreWdzanB5eGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDExMjAsImV4cCI6MjA3NjM3NzEyMH0.tr4uw9g_1Kxf9Qz_-rjxTImQqSQk2cqglAPKOv4_5iI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
