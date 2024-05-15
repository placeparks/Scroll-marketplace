import React from "react"
import styles from "./Skeleton.module.css"

export default function Skeleton({ height, width }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "inherit"
      }}
      className={styles.skeleton}
    />
  )
}
