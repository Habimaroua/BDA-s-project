export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conflits: {
        Row: {
          created_at: string | null
          description: string
          etudiant_id: string | null
          examen_1_id: string | null
          examen_2_id: string | null
          id: string
          lieu_id: string | null
          niveau: Database["public"]["Enums"]["niveau_conflit"]
          professeur_id: string | null
          resolu: boolean | null
          resolved_at: string | null
          solution: string | null
          type: Database["public"]["Enums"]["type_conflit"]
        }
        Insert: {
          created_at?: string | null
          description: string
          etudiant_id?: string | null
          examen_1_id?: string | null
          examen_2_id?: string | null
          id?: string
          lieu_id?: string | null
          niveau?: Database["public"]["Enums"]["niveau_conflit"]
          professeur_id?: string | null
          resolu?: boolean | null
          resolved_at?: string | null
          solution?: string | null
          type: Database["public"]["Enums"]["type_conflit"]
        }
        Update: {
          created_at?: string | null
          description?: string
          etudiant_id?: string | null
          examen_1_id?: string | null
          examen_2_id?: string | null
          id?: string
          lieu_id?: string | null
          niveau?: Database["public"]["Enums"]["niveau_conflit"]
          professeur_id?: string | null
          resolu?: boolean | null
          resolved_at?: string | null
          solution?: string | null
          type?: Database["public"]["Enums"]["type_conflit"]
        }
        Relationships: [
          {
            foreignKeyName: "conflits_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflits_examen_1_id_fkey"
            columns: ["examen_1_id"]
            isOneToOne: false
            referencedRelation: "examens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflits_examen_2_id_fkey"
            columns: ["examen_2_id"]
            isOneToOne: false
            referencedRelation: "examens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflits_lieu_id_fkey"
            columns: ["lieu_id"]
            isOneToOne: false
            referencedRelation: "lieux_examen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflits_professeur_id_fkey"
            columns: ["professeur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departements: {
        Row: {
          chef_id: string | null
          code: string
          created_at: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          chef_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          chef_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departements_chef_id_fkey"
            columns: ["chef_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disponibilites_professeur: {
        Row: {
          created_at: string | null
          date_specifique: string | null
          disponible: boolean | null
          heure_debut: string
          heure_fin: string
          id: string
          jour_semaine: number | null
          professeur_id: string
        }
        Insert: {
          created_at?: string | null
          date_specifique?: string | null
          disponible?: boolean | null
          heure_debut: string
          heure_fin: string
          id?: string
          jour_semaine?: number | null
          professeur_id: string
        }
        Update: {
          created_at?: string | null
          date_specifique?: string | null
          disponible?: boolean | null
          heure_debut?: string
          heure_fin?: string
          id?: string
          jour_semaine?: number | null
          professeur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disponibilites_professeur_professeur_id_fkey"
            columns: ["professeur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      examens: {
        Row: {
          created_at: string | null
          date_examen: string
          duree_minutes: number
          heure_debut: string
          heure_fin: string
          id: string
          lieu_id: string | null
          module_id: string
          nombre_inscrits: number | null
          session_id: string
          statut: Database["public"]["Enums"]["statut_examen"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_examen: string
          duree_minutes: number
          heure_debut: string
          heure_fin: string
          id?: string
          lieu_id?: string | null
          module_id: string
          nombre_inscrits?: number | null
          session_id: string
          statut?: Database["public"]["Enums"]["statut_examen"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_examen?: string
          duree_minutes?: number
          heure_debut?: string
          heure_fin?: string
          id?: string
          lieu_id?: string | null
          module_id?: string
          nombre_inscrits?: number | null
          session_id?: string
          statut?: Database["public"]["Enums"]["statut_examen"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "examens_lieu_id_fkey"
            columns: ["lieu_id"]
            isOneToOne: false
            referencedRelation: "lieux_examen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examens_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_examen"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          code: string
          created_at: string | null
          departement_id: string
          id: string
          niveau: string
          nom: string
          nombre_etudiants: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          departement_id: string
          id?: string
          niveau: string
          nom: string
          nombre_etudiants?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          departement_id?: string
          id?: string
          niveau?: string
          nom?: string
          nombre_etudiants?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formations_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
        ]
      }
      inscriptions_examen: {
        Row: {
          created_at: string | null
          etudiant_id: string
          examen_id: string
          id: string
          note: number | null
          present: boolean | null
        }
        Insert: {
          created_at?: string | null
          etudiant_id: string
          examen_id: string
          id?: string
          note?: number | null
          present?: boolean | null
        }
        Update: {
          created_at?: string | null
          etudiant_id?: string
          examen_id?: string
          id?: string
          note?: number | null
          present?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_examen_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_examen_examen_id_fkey"
            columns: ["examen_id"]
            isOneToOne: false
            referencedRelation: "examens"
            referencedColumns: ["id"]
          },
        ]
      }
      lieux_examen: {
        Row: {
          batiment: string | null
          capacite: number
          code: string
          created_at: string | null
          disponible: boolean | null
          equipements: string[] | null
          etage: number | null
          id: string
          nom: string
          type: string
          updated_at: string | null
        }
        Insert: {
          batiment?: string | null
          capacite: number
          code: string
          created_at?: string | null
          disponible?: boolean | null
          equipements?: string[] | null
          etage?: number | null
          id?: string
          nom: string
          type: string
          updated_at?: string | null
        }
        Update: {
          batiment?: string | null
          capacite?: number
          code?: string
          created_at?: string | null
          disponible?: boolean | null
          equipements?: string[] | null
          etage?: number | null
          id?: string
          nom?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          code: string
          coefficient: number | null
          created_at: string | null
          formation_id: string
          heures_cours: number | null
          heures_td: number | null
          heures_tp: number | null
          id: string
          nom: string
          responsable_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          coefficient?: number | null
          created_at?: string | null
          formation_id: string
          heures_cours?: number | null
          heures_td?: number | null
          heures_tp?: number | null
          id?: string
          nom: string
          responsable_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          coefficient?: number | null
          created_at?: string | null
          formation_id?: string
          heures_cours?: number | null
          heures_td?: number | null
          heures_tp?: number | null
          id?: string
          nom?: string
          responsable_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          nom: string
          prenom: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email: string
          id: string
          nom: string
          prenom: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string
          id?: string
          nom?: string
          prenom?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions_examen: {
        Row: {
          active: boolean | null
          annee_universitaire: string
          created_at: string | null
          date_debut: string
          date_fin: string
          id: string
          nom: string
          type: Database["public"]["Enums"]["type_examen"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          annee_universitaire: string
          created_at?: string | null
          date_debut: string
          date_fin: string
          id?: string
          nom: string
          type?: Database["public"]["Enums"]["type_examen"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          annee_universitaire?: string
          created_at?: string | null
          date_debut?: string
          date_fin?: string
          id?: string
          nom?: string
          type?: Database["public"]["Enums"]["type_examen"]
          updated_at?: string | null
        }
        Relationships: []
      }
      surveillances: {
        Row: {
          confirme: boolean | null
          created_at: string | null
          examen_id: string
          id: string
          professeur_id: string
          role: string | null
        }
        Insert: {
          confirme?: boolean | null
          created_at?: string | null
          examen_id: string
          id?: string
          professeur_id: string
          role?: string | null
        }
        Update: {
          confirme?: boolean | null
          created_at?: string | null
          examen_id?: string
          id?: string
          professeur_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveillances_examen_id_fkey"
            columns: ["examen_id"]
            isOneToOne: false
            referencedRelation: "examens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveillances_professeur_id_fkey"
            columns: ["professeur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      detecter_conflits_etudiants: { Args: never; Returns: number }
      detecter_conflits_surveillance: { Args: never; Returns: number }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verifier_capacite_salles: { Args: never; Returns: number }
    }
    Enums: {
      niveau_conflit: "faible" | "moyen" | "critique"
      statut_examen: "planifie" | "en_cours" | "termine" | "annule"
      type_conflit: "surveillance" | "etudiant" | "salle" | "horaire"
      type_examen: "rattrapage" | "normal"
      user_role:
        | "vice_doyen"
        | "admin"
        | "chef_departement"
        | "professeur"
        | "etudiant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      niveau_conflit: ["faible", "moyen", "critique"],
      statut_examen: ["planifie", "en_cours", "termine", "annule"],
      type_conflit: ["surveillance", "etudiant", "salle", "horaire"],
      type_examen: ["rattrapage", "normal"],
      user_role: [
        "vice_doyen",
        "admin",
        "chef_departement",
        "professeur",
        "etudiant",
      ],
    },
  },
} as const
