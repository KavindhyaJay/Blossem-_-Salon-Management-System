package com.blossem.reception_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String email; // email to link with customer collection and reception collection
    @Field("services")
    private Object servicesRaw;
    private String date;
    private String time;
    @Field("staff")
    private Object staff;
    @JsonProperty("total_payment")
    @Field("totalPayment")
    private Double totalPayment; // numeric amount synced to external collection

    @JsonProperty("paymentStatus")
    @JsonAlias({ "payment" })
    @Field("payment")
    private String paymentStatus; // Paid or Pending indicator

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonProperty("services")
    public String[] getServices() {
        return normalizeServices(servicesRaw);
    }

    @JsonProperty("services")
    public void setServices(String[] services) {
        this.servicesRaw = services;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    @JsonProperty("staff")
    public String getStaff() {
        return extractStaffName(staff);
    }

    @JsonProperty("staff")
    public void setStaff(String staffValue) {
        this.staff = staffValue;
    }

    @JsonProperty("total_payment")
    public Double getTotalPayment() {
        return totalPayment;
    }

    @JsonProperty("total_payment")
    public void setTotalPayment(Double totalPayment) {
        this.totalPayment = totalPayment;
    }

    @JsonProperty("paymentStatus")
    public String getPaymentStatus() {
        return paymentStatus;
    }

    @JsonProperty("paymentStatus")
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    private String extractStaffName(Object rawValue) {
        if (rawValue == null) {
            return null;
        }
        if (rawValue instanceof String str) {
            return str;
        }
        if (rawValue instanceof List<?>) {
            List<?> list = (List<?>) rawValue;
            if (!list.isEmpty() && list.get(0) != null) {
                return list.get(0).toString();
            }
            return null;
        }
        if (rawValue.getClass().isArray()) {
            int length = Array.getLength(rawValue);
            if (length > 0) {
                Object first = Array.get(rawValue, 0);
                return first != null ? first.toString() : null;
            }
            return null;
        }
        return rawValue.toString();
    }

    private String[] normalizeServices(Object rawValue) {
        if (rawValue == null) {
            return new String[0];
        }
        if (rawValue instanceof String[] array) {
            return array.clone();
        }
        if (rawValue instanceof List<?>) {
            List<?> list = (List<?>) rawValue;
            List<String> normalized = new ArrayList<>();
            for (Object entry : list) {
                if (entry != null) {
                    normalized.add(entry.toString());
                }
            }
            return normalized.toArray(new String[0]);
        }
        if (rawValue.getClass().isArray()) {
            int length = Array.getLength(rawValue);
            List<String> normalized = new ArrayList<>(length);
            for (int i = 0; i < length; i++) {
                Object entry = Array.get(rawValue, i);
                if (entry != null) {
                    normalized.add(entry.toString());
                }
            }
            return normalized.toArray(new String[0]);
        }
        return new String[] { rawValue.toString() };
    }

}
